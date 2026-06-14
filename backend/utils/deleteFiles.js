import fs from "fs/promises";

export const deleteFiles = async (paths) => {
  await Promise.all(
    paths.map(async (path) => {
      if (!path) return;

      try {
        await fs.unlink(path);
        console.log("Deleted:", path);
      } catch (error) {
        console.error(`Failed to delete ${path}:`, error.message);
      }
    })
  );
};