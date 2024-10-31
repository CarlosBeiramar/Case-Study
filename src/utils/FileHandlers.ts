import fs from 'fs';
import path from 'path';
import lockfile from 'proper-lockfile';

export const moduleFilePath = path.join(__dirname, '../../data/modules.json');
export const coursesFilePath = path.join(__dirname, '../../data/courses.json');
export const lessonsFilePath = path.join(__dirname, '../../data/lessons.json');


export const readFromFile = async (pathToFile: string) => {
    try {
      const release = await lockfile.lock(pathToFile, { realpath: false });
      const data = fs.readFileSync(pathToFile, 'utf-8');

      release();

      if (!data)
        return []

      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading from file:", error);
    }
};

export const writeToFile = async (pathToFile: string, data: any) => {
  try {
    const release = await lockfile.lock(pathToFile, { realpath: false });

    fs.writeFileSync(pathToFile, JSON.stringify(data, null, 2), 'utf-8');

    release();
  } catch (error) {
      console.error("Error writing to file:", error);
  }
};
