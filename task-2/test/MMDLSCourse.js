const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MMDLSCourse Contract", function () {
    let MMDLSCourse, mmdlsCourse, professor, student1, student2, student3, nonProfessor;

    beforeEach(async function () {
        [professor, student1, student2, student3, nonProfessor] = await ethers.getSigners();

        MMDLSCourse = await ethers.getContractFactory("MMDLSCourse");
        mmdlsCourse = await MMDLSCourse.connect(professor).deploy();
    });

    it("Should set the deployer as the professor", async function () {
        expect(await mmdlsCourse.professor()).to.equal(professor.address);
    });

    it("Should allow the professor to assign grades", async function () {
        const grades = [9, 8, 7, 6, 5, 4, 3, 2];

        await mmdlsCourse.connect(professor).assignGrades(student1.address, grades);

        const retrievedGrades = await mmdlsCourse.getGrades(student1.address);
        const normalGrades = retrievedGrades.map((g) => Number(g));

        expect(normalGrades).to.deep.equal(grades);
    });

    it("Should not allow to assign grades, each grade must be between 0 and 10.", async function () {
        const grades = [9, 8, 7, 6, 5, 4, 3, 11];
        await expect(mmdlsCourse.connect(professor).assignGrades(student1.address, grades))
            .to.be.revertedWith("Each grade must be between 0 and 10.");
    });

    it("Should not allow non-professors to assign grades", async function () {
        const grades = [9, 8, 7, 6, 5, 4, 3, 2];
        await expect(mmdlsCourse.connect(nonProfessor).assignGrades(student1.address, grades))
            .to.be.revertedWith("Only the professor can perform this action.");
    });

    it("Should compute the correct final grade when ExamFinal > 0", async function () {
        const grades = [9, 8, 7, 6, 5, 4, 3, 9]; 
        await mmdlsCourse.connect(professor).assignGrades(student1.address, grades);

        await mmdlsCourse.connect(professor).computeFinalGrade(student1.address);

        const finalGrade = await mmdlsCourse.getFinalGrade(student1.address);
        console.log(Number(finalGrade))
        expect(Number(finalGrade)).to.equal(8);
    });

    it("Should compute the correct final grade when ExamFinal == 0", async function () {
        const grades = [10, 10, 10, 10, 10, 10, 5, 0]; 
        await mmdlsCourse.connect(professor).assignGrades(student1.address, grades);

        await mmdlsCourse.connect(professor).computeFinalGrade(student1.address);

        const finalGrade = await mmdlsCourse.getFinalGrade(student1.address);
        expect(Number(finalGrade)).to.equal(10);
    });

    it("Should set the final grade to 0 if ExamFinal == 0 and Intermediate < 6", async function () {
        const grades = [1, 1, 1, 1, 1, 1, 0, 0]; 
        await mmdlsCourse.connect(professor).assignGrades(student1.address, grades);

        await mmdlsCourse.connect(professor).computeFinalGrade(student1.address);

        const finalGrade = await mmdlsCourse.getFinalGrade(student1.address);
        expect(Number(finalGrade)).to.equal(0);
    });

    it("Should overwrite existing grades and recompute final grade", async function () {
        const initialGrades = [10, 10, 10, 10, 10, 10, 10, 10];
        const newGrades = [8, 8, 8, 8, 8, 8, 8, 8];

        await mmdlsCourse.connect(professor).assignGrades(student1.address, initialGrades);
        await mmdlsCourse.connect(professor).computeFinalGrade(student1.address);

        let finalGrade = await mmdlsCourse.getFinalGrade(student1.address);
        expect(Number(finalGrade)).to.equal(10);

        await mmdlsCourse.connect(professor).assignGrades(student1.address, newGrades);
        await mmdlsCourse.connect(professor).computeFinalGrade(student1.address);

        finalGrade = await mmdlsCourse.getFinalGrade(student1.address);
        expect(Number(finalGrade)).to.equal(8);
    });
});
