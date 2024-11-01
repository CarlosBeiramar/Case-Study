import fs from 'fs';
import path, { relative } from 'path';
import lockfile from 'proper-lockfile';
import { Course } from '../models/Course';

export const moduleFilePath = path.join(__dirname, '../../data/modules.json');
export const coursesFilePath = path.join(__dirname, '../../data/courses.json');
export const lessonsFilePath = path.join(__dirname, '../../data/lessons.json');


export const readFromFile = async (pathToFile: string) => {
    let release;
    try {
      release = await lockfile.lock(pathToFile, { realpath: false });
      const data = fs.readFileSync(pathToFile, 'utf-8');

      if (!data)
        return []

      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading from file:", error);
    } finally {
      if (release) release();
    }
};

export const writeToFile = async (pathToFile: string, data: any) => {
  let release;
  try {
    release = await lockfile.lock(pathToFile, { realpath: false });

    fs.writeFileSync(pathToFile, JSON.stringify(data, null, 2), 'utf-8');

  } catch (error) {
      console.error("Error writing to file:", error);
  } finally {
    if (release) release();
  }
};
