# File

This component enables you to upload files to the browser and add them to a react context and integrate them in your workflow.

[Preview this component](https://vorhdam-registry.vercel.app/components/file)

### Installation

`bunx --bun shadcn@latest add https://vorhdam-registry.vercel.app/r/file.json`

### Usage

```
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
                    <FileDescription>Image files that are smaller than 1 MB</FileDescription>
                </FileContent>
                <FileLoader>Uploading...</FileLoader>
            </FileField>
            <FileList />
            <FileError className="w-full text-left" />
            <FileSubmit>Upload</FileSubmit>
        </FileInput>
    </FileProvider>
```

## Customizability

### Workflow

If you want to restrict what files your component allows visit the @/lib/file.ts file.
It stores the acceptable file types in the Mimes variable and other important typescript types. If you want to add a usable type, choose one from here: [IANA Media Types](https://www.iana.org/assignments/media-types/media-types.xhtml)

You can also modify the validation process of the files by editing the `@/lib/file.ts` file.
If your file changes during the workflow, return the modified file like this:

`return { success: true, file: modifiedFile };`

This can be very useful if you want to compress image or video files to webp or webm format.

If a user runs into an error during the workflow use this:

`return { success: false, message: "Your error message."};`

The message will automatically become an error that is shown to the user and the file upload will result in faliure and no files will be uploaded and the ones stored will be removed from the array.

### Custom logic

If you need to add a custom logic you can try editing the `@/components/ui/file.tsx` file which initiates the workflow and stores the react components.

### Translation

There are a few default messages I included. These can be found at the `@/lib/file.ts` file.
If you want to translate your app to another language add your translation logic to this file (good if you work with one language) or search for messages in the installed files and replace messages with your own translations (recommended).
