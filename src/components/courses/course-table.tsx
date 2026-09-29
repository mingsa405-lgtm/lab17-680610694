import { ConfirmDeleteButton } from "@/components/confirm-button";
import { Badge } from "@/components/ui/badge"; // นำเข้า Badge สำหรับแสดงหลักสูตรและการรับข่าวสาร
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";

/**
 * ฟังก์ชันช่วยแปลงค่า semester จาก "1", "2", "3" ให้เป็นข้อความภาษาไทย
 */
const formatSemester = (semester?: string) => {
  switch (semester) {
    case "1":
      return "ภาคการศึกษาที่ 1";
    case "2":
      return "ภาคการศึกษาที่ 2";
    case "3":
      return "ภาคฤดูร้อน";
    default:
      return semester || "—";
  }
};

export function CourseTable() {
  const courses = useEnrollmentStore((s) => s.courses);
  const removeCourse = useEnrollmentStore((s) => s.removeCourse);

  return (
    <div className="rounded-lg border">
      <Table>
        {/* ------------------------------------------------------------- */}
        {/* ข้อ 5.1: เรียงคอลัมน์ตามลำดับฟอร์ม                                   */}
        {/* รหัสวิชา | ชื่อวิชา | หลักสูตร | ภาคการศึกษา | รายละเอียด | ผู้สอน | รับข่าวสารทางอีเมล | Action */}
        {/* ------------------------------------------------------------- */}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">รหัสวิชา</TableHead>
            <TableHead>ชื่อวิชา</TableHead>
            <TableHead>หลักสูตร</TableHead>
            <TableHead>ภาคการศึกษา</TableHead>
            <TableHead className="max-w-[200px]">รายละเอียด</TableHead>
            <TableHead>ผู้สอน</TableHead>
            <TableHead>รับข่าวสารทางอีเมล</TableHead>
            <TableHead className="w-20 text-center">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {courses.length === 0 && (
            <TableRow>
              {/* ปรับ colSpan เป็น 8 ตามจำนวนคอลัมน์ใหม่ */}
              <TableCell
                colSpan={8}
                className="h-20 text-center text-muted-foreground"
              >
                ยังไม่มีวิชาที่เปิดสอน
              </TableCell>
            </TableRow>
          )}

          {courses.map((course) => (
            <TableRow key={course.courseId}>
              {/* 1. รหัสวิชา */}
              <TableCell className="font-medium">
                {course.courseId}
              </TableCell>

              {/* 2. ชื่อวิชา */}
              <TableCell>
                {course.courseTitle}
              </TableCell>

              {/* 3. หลักสูตร: แสดงด้วย Badge */}
              <TableCell>
                {course.program ? (
                  <Badge variant="outline">{course.program}</Badge>
                ) : (
                  "—"
                )}
              </TableCell>

              {/* 4. ภาคการศึกษา: แปลงเป็นชื่อเต็ม */}
              <TableCell>
                {formatSemester(course.semester)}
              </TableCell>

              {/* 5. รายละเอียด: แสดงเครื่องหมาย — หากไม่มีข้อมูล */}
              <TableCell className="max-w-[200px] text-sm text-muted-foreground whitespace-pre-line">
                {course.description && course.description.trim().length > 0
                  ? course.description
                  : "—"}
              </TableCell>

              {/* 6. ข้อมูลผู้สอน: แสดงชื่อและอีเมลแต่ละคน (1 pts) */}
              <TableCell>
                <div className="space-y-1.5">
                  {course.instructors && course.instructors.length > 0 ? (
                    course.instructors.map((ins, idx) => (
                      <div key={idx} className="text-xs">
                        {/* ชื่อผู้สอน */}
                        <p className="font-medium text-foreground">{ins.name}</p>
                        {/* อีเมลผู้สอน */}
                        <p className="text-muted-foreground">{ins.email}</p>
                      </div>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </div>
              </TableCell>

              {/* 7. การรับข่าวสาร: แสดงสถานะด้วย Badge ("รับ" / "ไม่รับ") (1 pts) */}
              <TableCell>
                {course.notifyByEmail ? (
                  <Badge variant="default">รับ</Badge>
                ) : (
                  <Badge variant="secondary">ไม่รับ</Badge>
                )}
              </TableCell>

              {/* 8. Action: ใช้ปุ่ม ConfirmDeleteButton เดิม */}
              <TableCell className="text-center">
                <ConfirmDeleteButton
                  label={`ลบวิชา ${course.courseId}`}
                  title="ลบวิชา?"
                  description={`ลบ ${course.courseId} — ${course.courseTitle} ออกจากรายวิชาที่เปิดสอน พร้อมการลงทะเบียนทั้งหมดของวิชานี้`}
                  onConfirm={() => removeCourse(course.courseId)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}