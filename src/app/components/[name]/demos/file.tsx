import { ArrowUpFromLine } from "lucide-react";

// START
import {
  FileContent,
  FileDescription,
  FileError,
  FileField,
  FileIcon,
  FileInput,
  FileList,
  FileLoader,
  FileProvider,
  FileSubmit,
  FileTitle,
} from "@/components/ui/file";

export default function FileDemo() {
  const providerId = "demoId";

  return (
    <FileProvider
      providerId={providerId}
      accept={[
        "image/webp",
        "image/jpeg",
        "image/png",
        "image/heic",
        "image/heif",
      ]}
      maxFiles={1} // the max files the user can upload
      maxSize={1024 * 1024} // the max size of a file in bytes
    >
      <FileInput className="w-full" providerId={providerId}>
        <FileField>
          <FileContent>
            <FileIcon>
              <ArrowUpFromLine />
            </FileIcon>
            <FileTitle>Upload your files here</FileTitle>
            <FileDescription>
              Image files that are smaller than 1 MB
            </FileDescription>
          </FileContent>
          <FileLoader>Uploading...</FileLoader>
        </FileField>
        <FileList />
        <FileError className="w-full text-left" />
        <FileSubmit>Upload</FileSubmit>
      </FileInput>
    </FileProvider>
  );
}
// END

export const keywords = [
  "shadcn",
  "base ui",
  "react",
  "component",
  "file",
  "upload",
  "workflow",
];
