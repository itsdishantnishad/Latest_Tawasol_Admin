// services/AzureFaceApiClient.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

export type DetectionModel = "detection_01" | "detection_02" | "detection_03";
export type RecognitionModel = "recognition_01" | "recognition_02" | "recognition_03" | "recognition_04";

export interface IFaceRectangle {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface IDetectFaceResult {
  faceId: string;
  faceRectangle: IFaceRectangle;
  faceAttributes?: any;
}

export interface IFindSimilarResult {
  persistedFaceId: string;
  confidence: number;
}

export class AzureFaceApiClient {
  constructor(private endpoint: string, private key: string) {}

  // Tune these for F0 throttling behavior
  private readonly max429Retries = 6; // total attempts = 1 + retries
  private readonly maxWaitSeconds = 60; // cap wait

  private sleep(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }

  private parseRetryAfterSeconds(res: Response, bodyText?: string): number {
    // 1) Standard Retry-After (seconds)
    const ra = res.headers.get("Retry-After");
    if (ra) {
      const n = parseInt(ra, 10);
      if (!isNaN(n) && n > 0) return n;
    }

    // 2) Azure sometimes returns ms
    const raMs = res.headers.get("x-ms-retry-after-ms");
    if (raMs) {
      const n = parseInt(raMs, 10);
      if (!isNaN(n) && n > 0) return Math.ceil(n / 1000);
    }

    // 3) Your Face API error includes: "retry after 53 seconds"
    if (bodyText) {
      const m = bodyText.match(/retry after\s+(\d+)\s+seconds/i);
      if (m) {
        const n = parseInt(m[1], 10);
        if (!isNaN(n) && n > 0) return n;
      }
    }

    // fallback
    return 5;
  }

  /**
   * Fetch with key header + automatic retry for 429.
   * Does NOT throw on non-OK (caller decides).
   */
  private async fetchWithRetry(url: string, init: RequestInit, attempt = 0): Promise<Response> {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Ocp-Apim-Subscription-Key": this.key,
        ...(init.headers || {}),
      },
    });

    if (res.status === 429) {
      const txt = await res.text().catch(() => "");
      const waitSeconds = Math.min(this.parseRetryAfterSeconds(res, txt), this.maxWaitSeconds);

      if (attempt >= this.max429Retries) {
        // give up after retries
        throw new Error(`Face API rate limit (429). Details: ${txt}`);
      }

      await this.sleep(waitSeconds * 1000);
      return this.fetchWithRetry(url, init, attempt + 1);
    }

    return res;
  }

  /**
   * Fetch + throw on non-OK (but still retries 429 automatically).
   */
  private async doFetch(url: string, init: RequestInit): Promise<Response> {
    const res = await this.fetchWithRetry(url, init);

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Face API error ${res.status}: ${txt}`);
    }

    return res;
  }

  async largeFaceListExists(largeFaceListId: string): Promise<boolean> {
    const url = `${this.endpoint}/face/v1.0/largefacelists/${encodeURIComponent(largeFaceListId)}`;
    const res = await this.fetchWithRetry(url, { method: "GET" });

    if (res.status === 404) return false;
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Face API error ${res.status}: ${txt}`);
    }
    return true;
  }

  async createLargeFaceList(
    largeFaceListId: string,
    name: string,
    recognitionModel: RecognitionModel = "recognition_04"
  ): Promise<void> {
    const url = `${this.endpoint}/face/v1.0/largefacelists/${encodeURIComponent(largeFaceListId)}`;

    await this.doFetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, recognitionModel }),
    });
  }

  async ensureLargeFaceList(largeFaceListId: string, name: string): Promise<void> {
    const exists = await this.largeFaceListExists(largeFaceListId);
    if (!exists) {
      await this.createLargeFaceList(largeFaceListId, name, "recognition_04");
    }
  }

  async detectFromBytes(
    bytes: ArrayBuffer,
    detectionModel: DetectionModel,
    recognitionModel: RecognitionModel,
    returnFaceAttributes?: string,
    returnFaceId = true
  ): Promise<IDetectFaceResult[]> {
    const qp: string[] = [];
    qp.push(`returnFaceId=${returnFaceId ? "true" : "false"}`);
    qp.push(`detectionModel=${encodeURIComponent(detectionModel)}`);
    qp.push(`recognitionModel=${encodeURIComponent(recognitionModel)}`);
    if (returnFaceAttributes) qp.push(`returnFaceAttributes=${encodeURIComponent(returnFaceAttributes)}`);

    const url = `${this.endpoint}/face/v1.0/detect?${qp.join("&")}`;

    const res = await this.doFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: bytes,
    });

    return (await res.json()) as IDetectFaceResult[];
  }

  async addFaceToLargeFaceList(
    largeFaceListId: string,
    bytes: ArrayBuffer,
    rect: IFaceRectangle,
    detectionModel: DetectionModel = "detection_03",
    userData?: string
  ): Promise<string> {
    const targetFace = `${rect.left},${rect.top},${rect.width},${rect.height}`;
    const qp: string[] = [];
    qp.push(`targetFace=${encodeURIComponent(targetFace)}`);
    qp.push(`detectionModel=${encodeURIComponent(detectionModel)}`);
    if (userData) qp.push(`userData=${encodeURIComponent(userData.substring(0, 1024))}`);

    const url =
      `${this.endpoint}/face/v1.0/largefacelists/${encodeURIComponent(largeFaceListId)}` +
      `/persistedfaces?${qp.join("&")}`;

    const res = await this.doFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: bytes,
    });

    const json = (await res.json()) as { persistedFaceId: string };
    return json.persistedFaceId;
  }

  async trainLargeFaceList(largeFaceListId: string): Promise<void> {
    const url = `${this.endpoint}/face/v1.0/largefacelists/${encodeURIComponent(largeFaceListId)}/train`;
    await this.doFetch(url, { method: "POST" });
  }

  async getTrainingStatus(
    largeFaceListId: string
  ): Promise<{ status: "notstarted" | "running" | "succeeded" | "failed"; message?: string }> {
    const url = `${this.endpoint}/face/v1.0/largefacelists/${encodeURIComponent(largeFaceListId)}/training`;
    const res = await this.doFetch(url, { method: "GET" });
    return (await res.json()) as any;
  }

  async waitForTraining(largeFaceListId: string, timeoutMs = 30000, pollMs = 1000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const st = await this.getTrainingStatus(largeFaceListId);
      if (st.status === "succeeded") return;
      if (st.status === "failed") throw new Error(`LargeFaceList training failed: ${st.message || ""}`);
      await this.sleep(pollMs);
    }
    // Not fatal; training may still finish later
  }

  async findSimilarFromLargeFaceList(
    queryFaceId: string,
    largeFaceListId: string,
    mode: "matchPerson" | "matchFace" = "matchPerson",
    maxCandidates = 50
  ): Promise<IFindSimilarResult[]> {
    const url = `${this.endpoint}/face/v1.0/findsimilars`;

    const res = await this.doFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        faceId: queryFaceId,
        largeFaceListId,
        mode,
        maxNumOfCandidatesReturned: Math.min(maxCandidates, 1000),
      }),
    });

    return (await res.json()) as IFindSimilarResult[];
  }
}