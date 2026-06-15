import sharp from "sharp";
import path from "path";
import ffmpegPath from "ffmpeg-static";
import { exec } from "child_process";

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

export const compressOneVideo = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const command = `"${ffmpegPath}" -i "${inputPath}" -vcodec libx264 -crf 28 -preset fast "${outputPath}"`;

    exec(command, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(outputPath);
      }
    });
  });
};

export const compressVideos = async (videoFiles) => {
  const results = [];

  for (const file of videoFiles) {
    const originalPath = file.path;

    const outputPath = path.join(
      "uploads",
      `compressed-${Date.now()}-${file.filename}.mp4`,
    );

    const compressedPath = await compressOneVideo(originalPath, outputPath);

    results.push({
      originalPath,
      path: compressedPath,
    });
  }

  return results;
};
