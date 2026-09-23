// The orval-generated zod client includes a schema for the multipart file
// upload request (`zod.instanceof(Blob)`), which references the DOM-only
// `Blob`/`File` globals. This package intentionally has no "DOM" lib (it's
// server-only code) so those names don't exist here by default. Nothing on
// the server actually constructs a Blob/File — multer parses the real
// multipart upload — so these are just enough to satisfy the type checker.
// This file lives outside src/generated/ so `orval`'s clean step won't
// delete it on the next codegen run.
declare class Blob {}
declare class File extends Blob {}
