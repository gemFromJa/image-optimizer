const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { image_magic_numbers } = require("./constants");

let dir = "./images";
const MAX_DEPTH = 6;

const isDir = (path) => fs.existsSync(path) && fs.lstatSync(path).isDirectory();
const isImage = (file) => {
	/* @type { String} magic_bits */
	let magic_bits = file.toString("hex", 0, 4);
	// console.log(image_magic_numbers, magic_bits);
	let res = image_magic_numbers.findIndex((magic_num) => {
		// console.log(magic_bits, magic_num);
		return magic_bits.toUpperCase().startsWith(magic_num);
	});
	return res >= -1;
};
const optimizeFile = (file_path, output_dir = "") => {
	let file = fs.readFileSync(file_path);

	let res = isImage(file);
	if (res) {
		// console.log("Is image");
		// get file-name
		let output = `${path.join(output_dir || path.dirname(file_path), "optimized_" + path.basename(file_path))}`;

		sharp(file)
			.jpeg({ mozjpeg: true })
			.resize(1366, 768, {
				inside: true,
			})
			.toBuffer()
			.then((data) => {
				fs.writeFileSync(output, data);
			})
			.catch((err) => {
				console.log(`Error: ${err}`);
			});
	}
};

const traverseDir = (dir, level = 0) =>
	fs.readdir(dir, (err, files) => {
		files.forEach((file) => {
			let file_path = path.join(dir, file);
			if (isDir(file_path)) {
				if (level <= MAX_DEPTH) traverseDir(file_path, level + 1);
			} else {
				optimizeFile(file_path);
				console.log("Optimizing", file_path);
			}
		});
	});

let [_, __, directory, depth] = process.argv;

if (directory && depth) {
	depth = parseInt(depth);
	traverseDir(directory, depth);
} else {
	console.log("\n\nUsage: node index.js [:directory] [depth]\n\n");
}
