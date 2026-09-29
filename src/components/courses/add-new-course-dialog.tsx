"use client";

import { useState } from "react";
import { PlusCircle, RotateCcw, X } from "lucide-react";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import {
  createCourseFormSchema,
  type CourseFormValues,
} from "@/lib/schemas/course-schema";
import { useEnrollmentStore } from "@/lib/enrollment-store";

// กำหนดโครงสร้างค่าเริ่มต้นของฟอร์ม (ใช้สำหรับตอนโหลดหน้าและตอนสั่ง reset ฟอร์ม)
const defaultFormValues: CourseFormValues = {
  courseCode: "",
  courseName: "",
  instructors: [{ name: "", email: "" }], // ข้อ 2.1: เริ่มต้นมีผู้สอน 1 แถวว่าง
  program: "" as any,
  semester: "" as any,
  description: "",
  notifyByEmail: false, // ข้อ 3.4: ค่าเริ่มต้นปิด
};

export function AddNewCourseDialog() {
  // ดึง state และ action จาก Zustand Store
  const addCourse = useEnrollmentStore((s) => s.addCourse);
  const courses = useEnrollmentStore((s) => s.courses);
  
  // State ควบคุมการเปิด/ปิด Dialog
  const [open, setOpen] = useState(false);

  // -------------------------------------------------------------
  // ข้อ 1.2: การตั้งค่า useForm ร่วมกับ zodResolver และโหมด "onBlur"
  // -------------------------------------------------------------
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(createCourseFormSchema(courses)),
    mode: "onBlur", // ตรวจสอบความถูกต้องทันทีเมื่อคลิกหรือแท็บออกจากช่องกรอก
    defaultValues: defaultFormValues,
  });

  // -------------------------------------------------------------
  // ข้อ 2.1: เรียกใช้ useFieldArray สำหรับจัดการอาร์เรย์ instructors
  // -------------------------------------------------------------
  const { fields, append, remove } = useFieldArray({
    control,
    name: "instructors",
  });

  // -------------------------------------------------------------
  // ข้อ 3.3: ดึงค่า description มาเพื่อนับจำนวนตัวอักษรแบบ Real-time
  // -------------------------------------------------------------
  const descriptionValue =
    useWatch({
      control,
      name: "description",
      defaultValue: "",
    }) || "";

  // ฟังก์ชันเมื่อกดปุ่มบันทึกและข้อมูลผ่านการ validate ทั้งหมด
  const onSubmit = (data: CourseFormValues) => {
    // นำข้อมูลไปเพิ่มใน Zustand store
    addCourse({
      courseId: data.courseCode.trim(),
      courseTitle: data.courseName.trim(),
      // แปลงข้อมูล instructors ให้อยู่ในรูป Array Object { name, email }
      instructors: data.instructors.map((ins) => ({
        name: ins.name.trim(),
        email: ins.email.trim(),
      })),
      program: data.program,
      semester: data.semester,
      description: data.description?.trim(),
      notifyByEmail: data.notifyByEmail,
    });

    // ข้อ 4.2: บันทึกสำเร็จแล้วให้ล้างฟอร์ม และสั่งปิด Form
    reset(defaultFormValues);
    setOpen(false);
  };

  // ข้อ 4.2: เมื่อปิดฟอร์ม แล้วเปิดใหม่ ต้องแสดงฟอร์มที่ว่างเปล่า
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset(defaultFormValues); // สั่งล้างข้อมูลเมื่อผู้ใช้กดปิด Dialog
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>
        <PlusCircle className="h-4 w-4" />
        เพิ่มวิชา
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลวิชาเรียน ผู้สอน และรายละเอียดการเปิดสอน
            </DialogDescription>
          </DialogHeader>

          {/* ------------------------------------------------------------- */}
          {/* ข้อ 1.2 & 1.3: รหัสวิชา (Controller + Field / FieldLabel / FieldError) */}
          {/* ------------------------------------------------------------- */}
          <Controller
            name="courseCode"
            control={control}
            render={({ field, fieldState }) => {
              const isInvalid = !!fieldState.error;
              return (
                <Field data-invalid={isInvalid} className="grid gap-1.5">
                  <FieldLabel htmlFor="courseCode">รหัสวิชา</FieldLabel>
                  <Input
                    {...field}
                    id="courseCode"
                    placeholder="เช่น 261305"
                    inputMode="numeric"
                    maxLength={6}
                    aria-invalid={isInvalid} // ข้อ 1.2: มี aria-invalid
                    className={
                      // ข้อ 1.2: ขอบสีแดงเมื่อผิด
                      isInvalid
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }
                  />
                  {/* ข้อ 1.2: ข้อความ error ใต้ช่อง */}
                  {fieldState.error && (
                    <FieldError className="text-sm text-destructive">
                      {fieldState.error.message}
                    </FieldError>
                  )}
                </Field>
              );
            }}
          />

          {/* ------------------------------------------------------------- */}
          {/* ข้อ 1.2 & 1.3: ชื่อวิชา */}
          {/* ------------------------------------------------------------- */}
          <Controller
            name="courseName"
            control={control}
            render={({ field, fieldState }) => {
              const isInvalid = !!fieldState.error;
              return (
                <Field data-invalid={isInvalid} className="grid gap-1.5">
                  <FieldLabel htmlFor="courseName">ชื่อวิชา</FieldLabel>
                  <Input
                    {...field}
                    id="courseName"
                    placeholder="เช่น Mobile Application Development"
                    maxLength={100}
                    aria-invalid={isInvalid}
                    className={
                      isInvalid
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }
                  />
                  {fieldState.error && (
                    <FieldError className="text-sm text-destructive">
                      {fieldState.error.message}
                    </FieldError>
                  )}
                </Field>
              );
            }}
          />

          {/* ------------------------------------------------------------- */}
          {/* ข้อ 3.1: ชื่อหลักสูตร (Select) */}
          {/* ------------------------------------------------------------- */}
          <Controller
            name="program"
            control={control}
            render={({ field, fieldState }) => {
              const isInvalid = !!fieldState.error;
              return (
                <Field data-invalid={isInvalid} className="grid gap-1.5">
                  <FieldLabel htmlFor="program">ชื่อหลักสูตร</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      id="program"
                      aria-invalid={isInvalid}
                      className={
                        isInvalid
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                    >
                      <SelectValue placeholder="เลือกหลักสูตร" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CPE">
                        CPE — วิศวกรรมคอมพิวเตอร์
                      </SelectItem>
                      <SelectItem value="ISNE">
                        ISNE — วิศวกรรมระบบสารสนเทศและเครือข่าย
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <FieldError className="text-sm text-destructive">
                      {fieldState.error.message}
                    </FieldError>
                  )}
                </Field>
              );
            }}
          />

          {/* ------------------------------------------------------------- */}
          {/* ข้อ 3.2: ภาคการศึกษา (Radio Group) */}
          {/* ------------------------------------------------------------- */}
          <Controller
            name="semester"
            control={control}
            render={({ field, fieldState }) => {
              const isInvalid = !!fieldState.error;
              return (
                <Field data-invalid={isInvalid} className="grid gap-2">
                  <FieldLabel>ภาคการศึกษา</FieldLabel>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-wrap gap-4 pt-1"
                    aria-invalid={isInvalid}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="semester-1" />
                      <Label htmlFor="semester-1" className="cursor-pointer font-normal">
                        ภาคการศึกษาที่ 1
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="semester-2" />
                      <Label htmlFor="semester-2" className="cursor-pointer font-normal">
                        ภาคการศึกษาที่ 2
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* ส่งค่า "3" สำหรับภาคฤดูร้อนตาม type */}
                      <RadioGroupItem value="3" id="semester-3" />
                      <Label htmlFor="semester-3" className="cursor-pointer font-normal">
                        ภาคฤดูร้อน
                      </Label>
                    </div>
                  </RadioGroup>
                  {fieldState.error && (
                    <FieldError className="text-sm text-destructive">
                      {fieldState.error.message}
                    </FieldError>
                  )}
                </Field>
              );
            }}
          />

          {/* ------------------------------------------------------------- */}
          {/* ข้อ 2: ข้อมูลผู้สอนแบบ Array Fields */}
          {/* ------------------------------------------------------------- */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>ผู้สอน</Label>
                {/* ข้อ 2.3: แสดงจำนวนปัจจุบันใต้หัวข้อ เช่น "2/3 คน" */}
                <p className="text-xs text-muted-foreground">
                  {fields.length}/3 คน
                </p>
              </div>
              {/* ข้อ 2.1: ปุ่ม “เพิ่มผู้สอน” เรียก append และ disabled เมื่อครบ 3 คน */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", email: "" })}
                disabled={fields.length >= 3}
              >
                เพิ่มผู้สอน
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((item, index) => (
                <div
                  key={item.id} // ข้อ 2.1: ใช้ item.id ที่ useFieldArray สร้างให้เป็น key
                  className="flex items-start gap-2 rounded-md border p-3"
                >
                  {/* ข้อ 2.1: แสดงเลขลำดับ 1., 2., 3. */}
                  <span className="mt-2 text-sm font-semibold text-muted-foreground">
                    {index + 1}.
                  </span>

                  {/* ข้อ 2.2: ช่องชื่อผู้สอน พร้อม placeholder "กรอกชื่อผู้สอน" */}
                  <Controller
                    name={`instructors.${index}.name`}
                    control={control}
                    render={({ field, fieldState }) => {
                      const isInvalid = !!fieldState.error;
                      return (
                        <div className="flex-1 space-y-1">
                          <Input
                            {...field}
                            placeholder="กรอกชื่อผู้สอน"
                            aria-invalid={isInvalid}
                            className={
                              isInvalid
                                ? "border-destructive focus-visible:ring-destructive"
                                : ""
                            }
                          />
                          {fieldState.error && (
                            <p className="text-xs text-destructive">
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />

                  {/* ข้อ 2.2: ช่องอีเมลผู้สอน พร้อม placeholder "ต้องเป็นอีเมล @cmu.ac.th" */}
                  <Controller
                    name={`instructors.${index}.email`}
                    control={control}
                    render={({ field, fieldState }) => {
                      const isInvalid = !!fieldState.error;
                      return (
                        <div className="flex-1 space-y-1">
                          <Input
                            {...field}
                            type="email"
                            placeholder="ต้องเป็นอีเมล @cmu.ac.th"
                            aria-invalid={isInvalid}
                            className={
                              isInvalid
                                ? "border-destructive focus-visible:ring-destructive"
                                : ""
                            }
                          />
                          {fieldState.error && (
                            <p className="text-xs text-destructive">
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />

                  {/* ข้อ 2.1: ปุ่ม Icon X เรียก remove(index) และ disabled เมื่อเหลือ 1 คน */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* ข้อ 2.3: แสดง Error เมื่ออีเมลซ้ำกัน ผ่าน errors.instructors.root */}
            {errors.instructors?.root && (
              <p className="text-sm font-medium text-destructive">
                {errors.instructors.root.message}
              </p>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* ข้อ 3.3: รายละเอียด (Textarea) พร้อมตัวนับตัวอักษร */}
          {/* ------------------------------------------------------------- */}
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => {
              const charCount = descriptionValue.length; // จำนวนตัวอักษรปัจจุบัน
              const isOverLimit = charCount > 100; // ตรวจสอบว่าเกิน 100 ตัวหรือไม่
              const isInvalid = !!fieldState.error || isOverLimit;

              return (
                <Field data-invalid={isInvalid} className="grid gap-1.5">
                  <FieldLabel htmlFor="description">รายละเอียด</FieldLabel>
                  <Textarea
                    {...field}
                    id="description"
                    placeholder="กรอกรายละเอียดวิชาเรียน (ถ้ามี)"
                    aria-invalid={isInvalid}
                    className={
                      isInvalid
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }
                  />
                  <div className="flex justify-between items-center text-xs">
                    {fieldState.error ? (
                      <FieldError className="text-destructive">
                        {fieldState.error.message}
                      </FieldError>
                    ) : <span />}
                    {/* แสดงจำนวนอักขระ "0/100 ตัวอักษร" และเปลี่ยนเป็นสีแดงเมื่อเกิน 100 */}
                    <span
                      className={
                        isOverLimit
                          ? "text-destructive font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {charCount}/100 ตัวอักษร
                    </span>
                  </div>
                </Field>
              );
            }}
          />

          {/* ------------------------------------------------------------- */}
          {/* ข้อ 3.4: รับข่าวสารทางอีเมล (Switch) */}
          {/* ------------------------------------------------------------- */}
          <Controller
            name="notifyByEmail"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="notifyByEmail" className="cursor-pointer text-sm font-medium">
                    รับข่าวสารทางอีเมล
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    แจ้งเตือนผู้สอนเมื่อเปิดลงทะเบียน
                  </p>
                </div>
                <Switch
                  id="notifyByEmail"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />

          {/* ------------------------------------------------------------- */}
          {/* ข้อ 4.1: Footer มีปุ่ม “ล้างฟอร์ม” (Icon RotateCcw) และปุ่มบันทึก */}
          {/* ------------------------------------------------------------- */}
          <DialogFooter className="flex flex-row justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              // เรียก reset() เพื่อกลับเป็นค่าเริ่มต้นและล้าง error message โดยไม่ปิด Form
              onClick={() => reset(defaultFormValues)}
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              ล้างฟอร์ม
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}