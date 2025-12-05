import { getSP } from "./spSetup";
import "@pnp/sp/profiles";
import "@pnp/sp/files";
import "@pnp/sp/folders";

export const fetchUserProfilePicture = async (): Promise<string | null> => {
  try {
    const sp = getSP();
    const profile: any = await sp.profiles.myProperties();
    const fromTopLevel = profile?.PictureUrl || profile?.PictureURL;
    const fromProps =
      profile?.UserProfileProperties?.find((p: any) => p.Key === "PictureURL")
        ?.Value;

    const pictureUrl = fromTopLevel || fromProps || null;
    return pictureUrl;
  } catch (error) {
    console.error("Failed to fetch profile picture:", error);
    return null;
  }
};

export const fetchCurrentUserInfo = async (): Promise<{
  fullName: string;
  department: string;
} | null> => {
  try {
    const sp = getSP();
    const profile: any = await sp.profiles.myProperties();
    
    const fullName = profile?.DisplayName || profile?.AccountName || "";
    const department = 
      profile?.UserProfileProperties?.find((p: any) => p.Key === "Department")
        ?.Value || "";

    return { fullName, department };
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return null;
  }
};

export const getSiteUrl = async (): Promise<string> => {
  try {
    const ctx: any = (window as any)?._spPageContextInfo;
    if (ctx?.webServerRelativeUrl) {
      return ctx.webServerRelativeUrl;
    }

    if (ctx?.webAbsoluteUrl) {
      const url = new URL(ctx.webAbsoluteUrl);
      return url.pathname || "/";
    }
    const current = new URL(window.location.href);
    return current.pathname.replace(/\/SitePages\/.*/i, "");
  } catch (error) {
    console.error("Failed to fetch site URL:", error);
    return "";
  }
};

export const uploadProfilePicture = async (
  file: File,
  siteUrl: string
): Promise<string | null> => {
  try {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please select a valid image file");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB");
    }

    const sp = getSP();
    const fileName = `${Date.now()}-${file.name}`;
    const fileContent = await file.arrayBuffer();

    const normalizedSiteUrl = siteUrl.endsWith("/")
      ? siteUrl.slice(0, -1)
      : siteUrl;
    const folderServerRelativePath = `${normalizedSiteUrl}/User Photos`;

    await sp.web
      .getFolderByServerRelativePath(folderServerRelativePath)
      .files.addUsingPath(fileName, fileContent, { Overwrite: true });
    const serverRelativeUrl = `${folderServerRelativePath}/${fileName}`;
    return serverRelativeUrl;
  } catch (error) {
    console.error("Failed to upload profile picture:", error);
    throw error;
  }
};

export const updateUserProfilePicture = async (
  photoUrl: string
): Promise<void> => {
  try {
    const absoluteUrl =
      (window as any)?._spPageContextInfo?.webAbsoluteUrl ??
      document.location.origin;

    const response = await fetch(
      `${absoluteUrl}/_api/SP.UserProfiles.PeopleManager/SetMyProfilePicture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json;odata=verbose",
          Accept: "application/json;odata=verbose",
          "X-RequestDigest":
            (document.getElementById("__REQUESTDIGEST") as HTMLInputElement)
              ?.value || "",
        },
        body: JSON.stringify({ imageUrl: photoUrl }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update profile picture");
    }

    console.log("Profile picture updated successfully");
  } catch (error) {
    console.error("Failed to update profile picture:", error);
    throw error;
  }
};

export const copyProfileToClipboard = async (
  fullName: string,
  department: string
): Promise<void> => {
  const profileText = `${fullName}\n${department}`;
  await navigator.clipboard.writeText(profileText);
};

export const fetchImagesFromLibrary = async (
  libraryName: string,
  siteUrl: string 
): Promise<any[]> => {
  try {
    const sp = getSP();
    const items = await sp.web.lists.getByTitle(libraryName).items();
    return items;
  } catch (error) {
    console.error("Failed to fetch images from library:", error);
    return [];
  }
};

export const getFileMetadata = async (fileUrl: string): Promise<any> => {
  try {
    const sp = getSP();
    const file = sp.web.getFileByServerRelativePath(fileUrl);
    return await file();
  } catch (error) {
    console.error("Failed to fetch file metadata:", error);
    return null;
  }
};




