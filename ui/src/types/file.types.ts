import type {
  FileItem,
  DirectoryListing,
  FileContentPayload,
} from "@bindings/github.com/raitucarp/gown-ted/pkg/models/models";

export type { FileItem, DirectoryListing, FileContentPayload };

export interface EditorTab {
  id: string;
  title: string;
  filePath?: string;
  fileType: "txt" | "md" | "plain";
  content: string;
  isPlainMode: boolean;
}
