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
import { ArrowUpFromLine } from "lucide-react";

export default function FilePage() {
  const providerId = "preview";

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
      maxFiles={3}
      maxSize={1024 * 1024}
    >
      <FileInput className="w-full" providerId={providerId}>
        <FileField>
          <FileContent>
            <FileIcon>
              <ArrowUpFromLine />
            </FileIcon>
            <FileTitle>Upload your files here</FileTitle>
            <FileDescription>
              At most 3 images, each image smaller than 1 MB.
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
