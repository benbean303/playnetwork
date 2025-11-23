import axios from "axios";
import { readFile, writeFile, readdir, unlink, rmdir, stat, mkdir, copyFile } from "fs/promises";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";
import extract from "extract-zip";
import "dotenv/config";

// Convert the current file URL to a path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Replace these variables with your actual details
const accessToken = process.env.PLAYCANVAS_ACCESS_TOKEN;
const projectId = process.env.PLAYCANVAS_PROJECT_ID;
const appName = process.env.PLAYCANVAS_APP_NAME;
const branchId = process.env.PLAYCANVAS_BRANCH_ID;

const outputPath = join(__dirname, "..", "levels", `${appName}.zip`);
const levelsPath = join(__dirname, "..", "levels");

const configPath = join(levelsPath, "config.json");
const templatesPath = join(__dirname, "..", "templates");
const assetsPath = join(__dirname, "..", "assets");

// URL to start the export job
const scenesUrl = `https://playcanvas.com/api/projects/${projectId}/scenes?branchId=${branchId}`;
const exportUrl = `https://playcanvas.com/api/apps/download`;

async function fetchScenes() {
  try {
    console.log("Fetching scenes...");
    const response = await axios.get(scenesUrl, { headers });
    // Access the `result` key and map over the array to extract scene IDs
    const scenes = response.data.result.map((scene) => scene.id);
    return scenes;
  } catch (error) {
    console.error("Failed to fetch scenes:", error.response?.data || error);
    throw new Error("Cannot fetch scenes from PlayCanvas.");
  }
}

// Headers for authorization
const headers = {
  Authorization: `Bearer ${accessToken}`,
};

async function startExportJob() {
  try {
    // Start the export job
    const startResponse = await axios.post(
      exportUrl,
      {
        project_id: projectId,
        scenes,
        name: appName,
      },
      { headers },
    );

    const jobId = startResponse.data.id;
    console.log(`Export job started with ID: ${jobId}`);

    // Function to poll the job status
    await pollJobStatus(jobId);
  } catch (error) {
    console.error("Failed to start export job:", error);
  }
}

async function pollJobStatus(jobId) {
  const statusUrl = `https://playcanvas.com/api/jobs/${jobId}`;

  try {
    let completed = false;
    while (!completed) {
      const statusResponse = await axios.get(statusUrl, { headers });
      const jobStatus = statusResponse.data.status;

      if (jobStatus === "complete") {
        completed = true;
        console.log("Export job completed.");
        downloadApp(statusResponse.data.data.download_url);
      } else if (jobStatus === "error") {
        throw new Error("Export job ended with an error.");
      } else {
        console.log("Waiting for job to complete...");
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
      }
    }
  } catch (error) {
    console.error("Error polling job status:", error);
  }
}

async function downloadApp(downloadUrl) {
  console.log(downloadUrl);
  try {
    const response = await axios.get(downloadUrl, {
      responseType: "arraybuffer",
    });
    await writeFile(outputPath, response.data);
    console.log(`App downloaded successfully: ${outputPath}`);
    await extractZip(outputPath, levelsPath); // Move extraction here
    const config = await readConfig();
    await extractTemplates(config);
    await extractServerAssets(config);
    const keepFilenames = scenes.map((scene) => `${scene}.json`);
    // Call this function with the path to the 'levels' directory and the array of filenames to keep
    await cleanupDirectory(levelsPath, keepFilenames);
    await updateSceneFiles();
  } catch (error) {
    console.error("Failed to download app:", error);
  }
}

async function extractZip(filePath, targetPath) {
  try {
    await extract(filePath, { dir: targetPath });
    console.log("Extraction complete");
  } catch (error) {
    console.error("Extraction failed", error);
  }
}

async function cleanupDirectory(directory, keepFiles) {
  const exists = await stat(directory).then(() => true).catch(() => false);
  if (!exists) {
    await mkdir(directory, { recursive: true });
    return;
  }
  const entries = await readdir(directory, { withFileTypes: true });
  for (let entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await cleanupDirectory(entryPath, keepFiles); // Recurse into subdirectories
      await rmdir(entryPath); // Remove the now-empty directory
    } else if (!keepFiles?.includes(entry.name)) {
      await unlink(entryPath); // Delete the file if it's not in the keepFiles list
    }
  }
}

async function readConfig() {
  const configData = await readFile(configPath, "utf8");
  return JSON.parse(configData);
}

async function extractTemplates(config) {
  try {
    const assets = config.assets;
    await mkdir(templatesPath, { recursive: true });

    for (const assetId in assets) {
      const asset = assets[assetId];
      if (asset.type === "template") {
        const templateFilePath = join(templatesPath, `${asset.id}.json`);
        await writeFile(
          templateFilePath,
          JSON.stringify(asset, null, 2),
          "utf8",
        );
        console.log(`Template saved: ${templateFilePath}`);
      }
    }
  } catch (error) {
    console.error("Failed to extract templates:", error);
  }
}

async function extractServerAssets(config) {
  try {
    const assets = config.assets;
    await mkdir(assetsPath, { recursive: true });

    for (const assetId in assets) {
      const asset = assets[assetId];
      const tags = Array.isArray(asset.tags) ? asset.tags : [];
      if (!tags.includes("server-asset")) continue;

      const metadata = { ...asset };
      if (metadata.file?.url) {
        try {
          const decodedPath = decodeAssetPath(metadata.file.url);
          const sourcePath = join(levelsPath, decodedPath);
          const fileName = metadata.file.filename ? decodeURIComponent(metadata.file.filename) : basename(decodedPath);
          const targetName = `${metadata.id}-${fileName}`;
          const targetPath = join(assetsPath, targetName);
          await copyFile(sourcePath, targetPath);
          metadata.file.url = targetName;
        } catch (err) {
          console.error(`Failed to copy server asset file ${metadata.id}`, err);
          continue;
        }
      }

      const outputPath = join(assetsPath, `${metadata.id}.json`);
      await writeFile(outputPath, JSON.stringify(metadata, null, 2), "utf8");
      console.log(`Saved server asset ${metadata.id} -> ${outputPath}`);
    }
  } catch (error) {
    console.error("Failed to extract server assets:", error);
  }
}

async function updateSceneFiles() {
  try {
    const sceneFiles = scenes.map((scene) => `${scene}.json`);
    for (const sceneFile of sceneFiles) {
      const sceneFilePath = join(levelsPath, sceneFile);
      const sceneData = await readFile(sceneFilePath, "utf8");
      const scene = JSON.parse(sceneData);

      // Change the "id" property to "scene"
      if (scene.hasOwnProperty("id")) {
        scene.scene = scene.id;
        delete scene.id;
      }

      await writeFile(sceneFilePath, JSON.stringify(scene, null, 2), "utf8");
      console.log(`Scene file updated: ${sceneFilePath}`);
    }
  } catch (error) {
    console.error("Failed to update scene files:", error);
  }
}

function decodeAssetPath(urlPath) {
  return urlPath.split("/").map((segment) => decodeURIComponent(segment)).join("/");
}

const scenes = await fetchScenes();
await cleanupDirectory(templatesPath);
await cleanupDirectory(assetsPath);
await cleanupDirectory(levelsPath);
await startExportJob();
