import { create } from "zustand";
import { persist } from "zustand/middleware"; // นำเข้า middleware สำหรับบันทึก state ลง Web Storage อัตโนมัติ

import {
  students as initialStudents,
  courses as initialCourses,
  enrollments as initialEnrollments,
} from "@/lib/mock-data";
import type { Course, Enrollment, Student } from "@/lib/types";

// กำหนด Type ของ State และ Actions ทั้งหมดภายใน Zustand Store
type EnrollmentStore = {
  // ข้อมูล State
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];

  // Action จัดการข้อมูลนักศึกษา
  addStudent: (student: Student) => void;
  removeStudent: (studentId: string) => void;

  // Action จัดการข้อมูลรายวิชา
  addCourse: (course: Course) => void;
  removeInstructorFromCourse: (courseId: string, instructorEmail: string) => void;
  removeCourse: (courseId: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  // -------------------------------------------------------------
  // ใช้ persist middleware เพื่อดักจับการเปลี่ยนแปลง State แล้วบันทึกลง Local Storage
  // -------------------------------------------------------------
  persist(
    (set) => ({
      // โหลดข้อมูลเริ่มต้นจากไฟล์ mock-data.ts มาเก็บไว้ใน Store
      students: initialStudents,
      courses: initialCourses,
      enrollments: initialEnrollments,

      // ฟังก์ชันเพิ่มนักศึกษา: นำข้อมูลนักศึกษาใหม่ต่อท้าย Array เดิม
      addStudent: (student) =>
        set((state) => ({ students: [...state.students, student] })),

      // ฟังก์ชันลบนักศึกษา: กรองเอา ID ที่ต้องการลบออก ทั้งจากลิสต์นักศึกษาและข้อมูลการลงทะเบียน
      removeStudent: (studentId) =>
        set((state) => ({
          students: state.students.filter((s) => s.studentId !== studentId),
          enrollments: state.enrollments.filter(
            (e) => e.studentId !== studentId,
          ),
        })),

      // ฟังก์ชันเพิ่มวิชาเรียน: นำวิชาใหม่ต่อท้ายลิสต์วิชาเดิม
      addCourse: (course) =>
        set((state) => ({ courses: [...state.courses, course] })),

      // ฟังก์ชันลบผู้สอนออกจากวิชา: กรองผู้สอนโดยเทียบอีเมล (เนื่องจาก instructors เป็น Object { name, email })
      removeInstructorFromCourse: (courseId, instructorEmail) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.courseId === courseId
              ? {
                  ...course,
                  instructors: course.instructors.filter(
                    (inst) => inst.email !== instructorEmail,
                  ),
                }
              : course,
          ),
        })),

      // ฟังก์ชันลบวิชาเรียน: กรองวิชานั้นออก และลบรายการลงทะเบียน (enrollments) ของวิชานั้นทิ้งด้วย
      removeCourse: (courseId) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.courseId !== courseId),
          enrollments: state.enrollments.filter((e) => e.courseId !== courseId),
        })),
    }),
    {
      // -------------------------------------------------------------
      // ข้อ 6: การเก็บข้อมูลแบบ Local Storage (1 pts)
      // กำหนด Key ของ Local Storage ตามรูปแบบ: "lab17-2569-XXX(รหัสนศ.)"
      // รหัสนักศึกษา: 680610694 -> ชื่อ Key: "lab17-2569-680610694"
      // -------------------------------------------------------------
      name: "lab17-2569-680610694",

      // ฟังก์ชัน partialize: ใช้เลือกเฉพาะ State ที่ต้องการบันทึกลง Local Storage
      // กำหนดให้เก็บเฉพาะ students และ courses (ไม่ persist ข้อมูล enrollments)
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    },
  ),
);