// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MMDLSCourse {
    address public professor;

    struct Student {
        uint256[8] grades;
        uint256 finalGrade;
        bool hasFinalGrade;
    }

    mapping(address => Student) public students;

    modifier onlyProfessor() {
        require(msg.sender == professor, "Only the professor can perform this action.");
        _;
    }

    constructor() {
        professor = msg.sender;
    }

    function getGrades(address student) public view returns (uint256[8] memory) {
        return students[student].grades;
    }

    function assignGrades(address student, uint256[8] memory grades) public onlyProfessor {
        require(grades.length == 8, "Grades array must contain exactly 8 elements.");

        for (uint256 i = 0; i < grades.length; i++) {
            require(grades[i] <= 10, "Each grade must be between 0 and 10.");
        }
        
        students[student].grades = grades;
        students[student].hasFinalGrade = false;
    }

    function computeFinalGrade(address student) public onlyProfessor {
        Student storage s = students[student];

        uint256 maxHA1HA2 = max(s.grades[0] + s.grades[1], 2 * s.grades[6]);

         uint256 intermediate = min(
            round((10 * ((maxHA1HA2 + s.grades[2] + s.grades[3] + s.grades[4] + s.grades[5]))) / 6),
            10
        );

        if (s.grades[7] > 0) {
            s.finalGrade = min(round(10 * (40 * intermediate + 60 * s.grades[7]) / 100), 10);
        } else {
            s.finalGrade = intermediate >= 6 ? intermediate : 0;
        } 

        s.hasFinalGrade = true;
    }

    function getFinalGrade(address student) public view returns (uint256) {
        require(students[student].hasFinalGrade, "Final grade has not been computed for this student.");
        return students[student].finalGrade;
    }

    function getContractAddress() public view returns (address) {
        return address(this);
    }

    function round(uint256 x) internal pure returns (uint256) {
        return (x + 5) / 10;
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }
}
