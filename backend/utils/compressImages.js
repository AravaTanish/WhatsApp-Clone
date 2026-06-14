import sharp from "sharp";
import path from "path";

export const compressImages = async (files) => {
  return Promise.all(
    files.map(async (file) => {
      const compressedPath = path.join(
        "uploads",
        `compressed-${Date.now()}-${file.filename}.webp`,
      );

      await sharp(file.path)
        .resize({
          width: 1920,
          withoutEnlargement: true,
        })
        .webp({
          quality: 80,
        })
        .toFile(compressedPath);

      return {
        ...file,
        originalPath: file.path,
        path: compressedPath,
        mimetype: "image/webp",
      };
    }),
  );
};
