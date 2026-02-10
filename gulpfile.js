const path = require('path');
const gulp = require('gulp');
const { src, dest } = require('gulp');
const gulpif = require('gulp-if');
const ts = require('gulp-typescript');
const rename = require('gulp-rename');

// ss 2.x
const tsProject_2x = ts.createProject('tsconfig_2x.json');
// ss 2.1
const tsProject_21 = ts.createProject('tsconfig.json');

const is21File = (file) => {
    const contents = file.contents.toString();
    const version = contents.match(/@NApiVersion\s?(?<version>2.(\d+|x))/)?.groups.version || '2.x';
    const now = new Date();
    const timeString = `[${now.toLocaleTimeString()}]`;

    console.log(`${timeString} Compiling changes detected in SuiteScript ${version} file ${file.path}`);

    return version === '2.1';
};

gulp.task('watch', () => {
    gulp.watch('./TypeScript/HUL_DEV/**/*.ts').on('change', (filePath) => {
        // Normalize path to forward slashes
        const normalizedPath = filePath.toString().replace(/\\/g, '/');
        
        // Get just the relative path after TypeScript/
        const relativePath = normalizedPath.replace(/^.*?TypeScript\//, '');
        
        // Get the directory portion (without filename)
        const relativeDir = path.dirname(relativePath);
        
        // Build the destination path
        const destPath = `FileCabinet/SuiteScripts/${relativeDir}`;
        
        console.log('Source:', normalizedPath);
        console.log('Destination:', destPath);
        
        const logFinishMessage = () => {
            const now = new Date();
            const timeString = `[${now.toLocaleTimeString()}]`;
            console.log(`${timeString} Successfully compiled to ${destPath}`);
        };

        src(filePath, { base: path.dirname(filePath) })
        .pipe(gulpif(is21File, tsProject_21(), tsProject_2x()))
        .pipe(rename({ extname: '.js' }))
        .pipe(dest(destPath))
        .on('finish', logFinishMessage);

    })
})