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

  private sleep(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }

  private parseRetryAfterMs(res: Response, bodyText?: string): number | null {
    // 1) Standard header
    const ra = res.headers.get("retry-after");
    if (ra) {
      const asNum = Number(ra);
      if (!Number.isNaN(asNum) && asNum >= 0) return asNum * 1000;

      // HTTP-date format
      const dt = Date.parse(ra);
      if (!Number.isNaN(dt)) {
        const diff = dt - Date.now();
        if (diff > 0) return diff;
      }
    }

    // 2) Face API sometimes returns "Please retry after X seconds" in body
    if (bodyText) {
      const m = bodyText.match(/retry\s+after\s+(\d+)\s+seconds?/i);
      if (m?.[1]) {
        const sec = Number(m[1]);
        if (!Number.isNaN(sec) && sec >= 0) return sec * 1000;
      }
    }

    return null;
  }

  private isRetriableStatus(status: number): boolean {
    return status === 408 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
  }

  private async fetchWithRetry(url: string, init: RequestInit, maxRetries = 6): Promise<Response> {
    const baseDelayMs = 800;
    let lastErr: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(url, {
          ...init,
          headers: {
            "Ocp-Apim-Subscription-Key": this.key,
            ...(init.headers || {}),
          },
        });

        if (res.ok) return res;

        // Read body once for retry hints / better error
        const bodyText = await res.text().catch(() => "");

        if (!this.isRetriableStatus(res.status) || attempt === maxRetries) {
          // Not retriable (or out of retries)
          throw new Error(`Face API error ${res.status}: ${bodyText}`);
        }

        // Retriable
        const retryAfterMs = this.parseRetryAfterMs(res, bodyText);
        const backoffMs = baseDelayMs * Math.pow(2, attempt);
        const jitterMs = Math.floor(Math.random() * 250);
        const waitMs = Math.min(60_000, (retryAfterMs ?? backoffMs) + jitterMs);

        await this.sleep(waitMs);
        continue;
      } catch (e) {
        lastErr = e;

        // Fetch/network error → retry with backoff
        if (attempt === maxRetries) {
          throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
        }

        const backoffMs = baseDelayMs * Math.pow(2, attempt);
        const jitterMs = Math.floor(Math.random() * 250);
        await this.sleep(Math.min(60_000, backoffMs + jitterMs));
      }
    }

    // Should never reach, but keep TS happy
    throw lastErr instanceof Error ? lastErr : new Error("Face API error: unknown");
  }

  private async doFetch(url: string, init: RequestInit): Promise<Response> {
    // fetchWithRetry already throws a detailed error when needed
    return await this.fetchWithRetry(url, init);
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

  async createLargeFaceList(largeFaceListId: string, name: string, recognitionModel: RecognitionModel = "recognition_04"): Promise<void> {
    const url = `${this.endpoint}/face/v1.0/largefacelists/${encodeURIComponent(largeFaceListId)}`;

    await this.doFetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        recognitionModel,
      }),
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
    const url =
      `${this.endpoint}/face/v1.0/largefacelists/${encodeURIComponent(largeFaceListId)}/train`;

    await this.doFetch(url, { method: "POST" });
  }

  async getTrainingStatus(largeFaceListId: string): Promise<{ status: "notstarted" | "running" | "succeeded" | "failed"; message?: string }> {
    const url =
      `${this.endpoint}/face/v1.0/largefacelists/${encodeURIComponent(largeFaceListId)}/training`;

    const res = await this.doFetch(url, { method: "GET" });
    return (await res.json()) as any;
  }

  async waitForTraining(largeFaceListId: string, timeoutMs = 30000, pollMs = 1000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const st = await this.getTrainingStatus(largeFaceListId);
      if (st.status === "succeeded") return;
      if (st.status === "failed") throw new Error(`LargeFaceList training failed: ${st.message || ""}`);
      await new Promise(res => setTimeout(res, pollMs));
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