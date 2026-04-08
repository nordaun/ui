const Mimes = {
  application: [
    "pdf",
    "msword",
    "vnd.openxmlformats-officedocument.wordprocessingml.document",
    "vnd.ms-excel",
    "vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "vnd.ms-powerpoint",
    "vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  video: ["webm", "mp4", "mpeg", "ogg", "quicktime"],
  image: ["webp", "jpeg", "png", "gif", "heic", "heif"],
  text: ["plain", "csv", "xml"],
} as const satisfies Record<string, string[]>;

type MimeCategory = keyof typeof Mimes;

type Mime =
  | {
      [category in MimeCategory]: `${category}/${(typeof Mimes)[category][number]}`;
    }[MimeCategory]
  | (string & {});

const messages = {
  sizeLarge: "Your file is too large.",
  typeInvalid: "Your file has an invalid type.",
  tooManyFiles: "You are uploading too many files.",
  noFiles: "You didn't upload any files.",
  unexpected: "An unexpected error occured.",
};

type WorkflowProps = {
  file: File;
  maxSize: number;
  accept: Mime[];
};

type WorkflowResult =
  | {
      success: true;
      file: File;
    }
  | {
      success: false;
      message: string;
    };

/**
 * This workflow executes everytime a user adds a new file to your input (feel free to add other params you need)
 * @param file The file that the user uploaded
 * @param maxSize The max size you allowed in the file context provider
 * @param accept The mimes the user can upload you allowed in the file context provider
 */
function workflow({ file, maxSize, accept }: WorkflowProps): WorkflowResult {
  // Add your validation, compression or any other file logic here:
  if (file.size > maxSize)
    return { success: false, message: messages["sizeLarge"] };
  if (!accept.includes(file.type))
    return { success: false, message: messages["typeInvalid"] };

  return {
    success: true,
    file: file,
  };
}

export { messages, Mimes, workflow, type Mime };
