const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { v4: uuid } = require("uuid");
const util = require("util");

const execPromise = util.promisify(exec);
const TEMP_DIR = path.join(__dirname, "temp");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

const LANGUAGE_CONFIG = {
    cpp: {
        filename: "program.cpp",
        runCmd: (filename) =>
            `g++ /app/${filename} -o /app/a.out && /app/a.out`,
    },
    py: {
        filename: "script.py",
        runCmd: (filename) => `python3 /app/${filename}`,
    },
    js: {
        filename: "app.js",
        runCmd: (filename) => `node /app/${filename}`,
    },
};

const MAX_EXECUTION_TIME = 5000; // 5 seconds
const MAX_CONTAINER_CLEANUP_TIME = 10000; // 10 seconds

const cleanupFiles = async (codePath, inputPath) => {
    try {
        if (fs.existsSync(codePath)) {
            await fs.promises.unlink(codePath);
        }
        if (inputPath && fs.existsSync(inputPath)) {
            await fs.promises.unlink(inputPath);
        }
    } catch (error) {
        console.error('Error cleaning up files:', error);
    }
};

const cleanupContainer = async (containerId) => {
    try {
        await execPromise(`docker rm -f ${containerId}`, { timeout: MAX_CONTAINER_CLEANUP_TIME });
    } catch (error) {
        console.error('Error cleaning up container:', error);
    }
};

const executeCode = async (language, code, input = "") => {
    const config = LANGUAGE_CONFIG[language];
    if (!config) {
        throw new Error("Language not supported");
    }

    const id = uuid();
    const codeFile = `${id}-${config.filename}`;
    const inputFile = `${id}-input.txt`;
    const containerId = `code-runner-${id}`;

    const codePath = path.join(TEMP_DIR, codeFile);
    const inputPath = input ? path.join(TEMP_DIR, inputFile) : null;

    try {
        // Write files
        await fs.promises.writeFile(codePath, code);
        if (input) {
            await fs.promises.writeFile(inputPath, input);
        }

        const runCmd = input
            ? `${config.runCmd(config.filename)} < /app/${inputFile}`
            : `${config.runCmd(config.filename)}`;

        const dockerCmd = `docker run --rm \
            --name ${containerId} \
            --cpus="0.5" \
            --memory="128m" \
            --pids-limit=30 \
            --network=none \
            --security-opt no-new-privileges:true \
            -v "${codePath}:/app/${config.filename}:ro" \
            ${input ? `-v "${inputPath}:/app/${inputFile}:ro"` : ""} \
            code-runner \
            bash -c "${runCmd}"`;

        try {
            const { stdout, stderr } = await execPromise(dockerCmd, { timeout: MAX_EXECUTION_TIME });
            return stderr || stdout;
        } catch (error) {
            // If execution fails, try to clean up the container
            await cleanupContainer(containerId);
            return error.stderr || error.message;
        }
    } catch (error) {
        return error.message;
    } finally {
        // Clean up files
        await cleanupFiles(codePath, inputPath);
    }
};

module.exports = { executeCode };
