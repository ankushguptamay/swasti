function capitalizeFirstLetter(str) {
    const words = str.split(" ");

    return words.map((word) => {
        return word[0].toUpperCase() + (word.substring(1)).toLowerCase();;
    }).join(" ");
}

function createCodeForCourse(str) {
    const words = str.split(" ");

    const upperCase = words.map((word) => {
        return word[0].toUpperCase() + (word.substring(1)).toLowerCase();;
    }).join(" ");
    return code = upperCase.replaceAll(' ', '-');
}

module.exports = {
    capitalizeFirstLetter: capitalizeFirstLetter,
    createCodeForCourse: createCodeForCourse
};