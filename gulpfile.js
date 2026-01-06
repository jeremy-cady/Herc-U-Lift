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
        const parsedPath = path.parse(filePath);
        console.log('parsedPath:', parsedPath);
        const filePathString = filePath.toString();
        const splitString = filePathString.split('/');
        splitString.pop();
        console.log('splitString', splitString);
        const newString = splitString.join('/');
        console.log('newString', newString);
        const destPath = newString.replace('TypeScript/HUL', 'FileCabinet/SuiteScripts/HUL');
        console.log('destPath', destPath);
        const logFinishMessage = () => {
            const now = new Date();
            const timeString = `[${now.toLocaleTimeString()}]`;
            console.log(`${timeString} Successfully compiled to ${destPath}`);
        };

        src(filePath)
        .pipe(gulpif(is21File, tsProject_21(), tsProject_2x()))
        .pipe(rename({ extname: '.js' }))
        .pipe(dest(`${destPath}`))
        .on('finish', logFinishMessage);

    })
})









// const is21File = (file) => {
//     const contents = file.contents.toString();
//     const version = contents.match(/@NApiVersion\s?(?<version>2.(\d+|x))/)?.groups.version || '2.x';
//     const now = new Date();
//     const timeString = `[${now.toLocaleTimeString()}]`;
    
//     console.log(`${timeString} Compiling changes detected in SuiteScript ${version} file ${file.path}`);

//     return version === '2.1';
// };

// gulp.task('watch', () => {
//     // typescript files
//     gulp.watch('./TypeScript/**/*.ts').on('change', (filePath) => {
//         const parsedPath = path.parse(filePath);
//         console.log('parsedPath', parsedPath);
//         const outDir = process.platform === 'win32' ? 'FileCabinet/' : `FileCabinet/${parsedPath.dir}`;
//         console.log('outDir', outDir);
//         const logFinishMessage = () => {
//             const now = new Date();
//             const timeString = `[${now.toLocaleTimeString()}]`;
//             console.log(`${timeString} Successfully compiled to ${outDir}/${parsedPath.name}.js\n`);
//         };

//         gulp.src(filePath)
//             .pipe(gulpif(is21File, tsProject_21, tsProject_2x))
//             .on('error', logFinishMessage)
//             .pipe(gulp.dest(outDir))
//             .on('finish', logFinishMessage);
//     });

    // non-ts files, extend the glob array to exclude other files (.py for example)
    // gulp.watch(['./TypeScript/**/*', '!./TypeScript/**/*.ts']).on('change', (filePath) => {
    //     const parsedPath = path.parse(filePath);
    //     const outDir = process.platform === 'win32' ? 'FileCabinet/' : `FileCabinet/${parsedPath.dir}`;
    //     const now = new Date();
    //     const timeString = `[${now.toLocaleTimeString()}]`;

    //     console.log(`${timeString} Saving non-ts file to FileCabinet/${filePath}`);
    //     gulp.src(filePath).pipe(gulp.dest(outDir));
    // });
