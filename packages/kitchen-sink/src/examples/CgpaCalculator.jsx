import React, { useState } from 'react';
import { block } from 'million/react';


function CGPACalculator() {
  const [subjects, setSubjects] = useState([
    { name: '', creditHours: 0, grade: '' },
  ]);
  const [totalCreditHours, setTotalCreditHours] = useState(0);
  const [totalGradePoints, setTotalGradePoints] = useState(0);
  const [cgpa, setCGPA] = useState(0);

  const handleSubjectChange = (index, fieldName, value) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index][fieldName] = value;
    setSubjects(updatedSubjects);
  };

  block();

  const addSubject = () => {
    setSubjects([...subjects, { name: '', creditHours: 0, grade: '' }]);
  };

  const calculateCGPA = () => {
    let totalCH = 0;
    let totalGP = 0;

    subjects.forEach((subject) => {
      const { creditHours, grade } = subject;
      totalCH += parseFloat(creditHours);
      totalGP += parseFloat(creditHours) * getGradePoint(grade);
    });

    if (totalCH === 0) {
      setCGPA(0);
    } else {
      const cgpa = totalGP / totalCH;
      setCGPA(cgpa.toFixed(2));
    }

    setTotalCreditHours(totalCH);
    setTotalGradePoints(totalGP);
  };

  const getGradePoint = (grade) => {
    switch (grade) {
      case 'A+':
        return 4.00;
      case 'A':
        return 3.75;
      case 'A-':
        return 3.50;
      case 'B+':
        return 3.25;
      case 'B':
        return 3.00;
      case 'B-':
        return 2.75;
      case 'C+':
        return 2.50;
      case 'C':
        return 2.25;
      case 'C-':
        return 2.00;
      case 'D':
        return 1.00;
      case 'F':
        return 0.00;
      default:
        return 0.00;
    }
  };

  return (
    <div>
      <h1>CGPA Calculator</h1>
      {subjects.map((subject, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="Subject Name"
            value={subject.name}
            onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
          />
          <input
            type="number"
            placeholder="Credit Hours"
            value={subject.creditHours}
            onChange={(e) =>
              handleSubjectChange(index, 'creditHours', e.target.value)
            }
          />
          <select
            value={subject.grade}
            onChange={(e) => handleSubjectChange(index, 'grade', e.target.value)}
          >
            <option value="">Select Grade</option>
            <option value="A+">A+</option>
            <option value="A">A</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B">B</option>
            <option value="B-">B-</option>
            <option value="C+">C+</option>
            <option value="C">C</option>
            <option value="C-">C-</option>
            <option value="D">D</option>
            <option value="F">F</option>
          </select>
        </div>
      ))}
      <button onClick={addSubject}>Add Subject</button>
      <button onClick={calculateCGPA}>Calculate CGPA</button>
      <div>
        <p>Total Credit Hours: {totalCreditHours}</p>
        <p>Total Grade Points: {totalGradePoints}</p>
        <p>CGPA: {cgpa}</p>
      </div>
    </div>
  );
}

export default CGPACalculator;
