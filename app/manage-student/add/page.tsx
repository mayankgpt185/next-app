'use client';

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/app/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { set } from 'lodash';

interface Class {
  _id: string;
  classNumber: number;
}

interface Section {
  _id: string;
  section: string;
}

interface AcademicYear {
  _id: string;
  startDate: string;
  endDate: string;
}

const formSchema = (isUpdate: boolean) => z.object({
  firstName: z.string()
    .nonempty("First name is required")
    .min(2, "First name must be at least 2 characters long"),
  lastName: z.string()
    .nonempty("Last name is required")
    .min(2, "Last name must be at least 2 characters long"),
  email: z.string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: isUpdate ? z.string().optional() : z.string()
    .nonempty("Password is required")
    .min(6, "Password must be at least 6 characters long"),
  address: z.string()
    .nonempty("Address is required")
    .min(5, "Address must be at least 5 characters long"),
  dateJoined: z.string().nonempty("Date joined is required"),
  classId: z.string().nonempty("Class is required"),
  sectionId: z.string().nonempty("Section is required"),
});


type FormData = z.infer<ReturnType<typeof formSchema>>;

export default function AddStudentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const studentRole = "STUDENT";
  const isUpdate = !!id; // If `id` exists, it's an update, otherwise it's a new user
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [isLoading, setIsLoading] = useState(true);


  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema(isUpdate)),
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesResponse, sectionsResponse] = await Promise.all([
          fetch('/api/classes'),
          fetch('/api/sections')
        ]);

        if (!classesResponse.ok || !sectionsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const classesData = await classesResponse.json();
        const sectionsData = await sectionsResponse.json();

        setClasses(classesData);
        setSections(sectionsData);

        // After classes and sections are loaded, fetch course data if editing
        if (id) {
          fetchUserData(classesData, sectionsData);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load classes and sections');
        setIsLoading(false);
      }
    };

    const fetchUserData = async (classesData: Class[], sectionsData: Section[]) => {
      try {
        const response = await fetch(`/api/manage-staff?id=${id}`);
        const studentClassResponse = await fetch(`/api/student-class`);
        if (!response.ok || !studentClassResponse.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        const studentClassData = await studentClassResponse.json();
        setValue("firstName", data.firstName || '');
        setValue("lastName", data.lastName || '');
        setValue("email", data.email || '');
        setValue("address", data.address || '');
        setValue("dateJoined", new Date(data.dateJoined).toISOString().split('T')[0]);
        // Find the matching class and section from the loaded data
        const matchingClass = studentClassData.find((cls: any) => cls.studentId === data._id);
        const matchingSection = sectionsData.find(s => s.section === matchingClass?.section.section);
        setValue("classId", matchingClass?.class._id || '');
        setValue("sectionId", matchingSection?._id || '');

      } catch (error) {
        toast.error('Error fetching student data');
      }
    };

    const fetchAcademicYears = async () => {
      try {
        const response = await fetch('/api/session');
        if (!response.ok) {
          throw new Error('Failed to fetch academic years');
        }
        const data = await response.json();
        
        setAcademicYears(data);
        
        if (data.length > 0) {
          // Sort by startDate in descending order
          const sortedYears = [...data].sort((a, b) => 
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
          
          setSelectedAcademicYearId(sortedYears[0]._id);
        }
      } catch (error) {
        console.error('Error fetching academic years:', error);
        toast.error('Failed to load academic years');
      }
    };

    // Call fetchData to start the data loading process
    fetchData();
    fetchAcademicYears();
  }, [id, setValue]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {

    const method = id ? 'PUT' : 'POST';
    const userData = id ? { ...data, id } : {
      ...data,
      role: studentRole,
      academicYearId: [selectedAcademicYearId]
    };
    const response = await fetch(`/api/manage-staff${id ? `?id=${id}` : ''}`, {

      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      toast.error(responseData.error || 'An error occurred');
    } else {
      const studentClassData = {
        studentId: responseData._id,
        classId: data.classId,
        sectionId: data.sectionId,
      }
      const studentClassResponse = await fetch(`/api/student-class${responseData._id ? `?studentId=${responseData._id}` : ''}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentClassData),
      });

      const studentClassResponseData = await studentClassResponse.json();

      if (!studentClassResponse.ok) {
        toast.error(studentClassResponseData.error || 'An error occurred');
      } else {
        toast.success(id ? 'Student member updated successfully!' : 'Student member created successfully!');
        router.push('/manage-student');
      }
    }
  };

  return (
    <div className="flex flex-col w-full p-6 bg-base-100 min-h-screen">
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-base-content mb-6">{id ? 'Edit Student Member' : 'Add New Student Member'}</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">First Name</span>
                </label>
                <input
                  type="text"
                  {...register("firstName")}
                  className={`input input-bordered w-full bg-base-100 text-base-content ${errors.firstName ? 'input-error' : ''}`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.firstName.message}</span>
                  </label>
                )}
              </div>

              {/* Last Name */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Last Name</span>
                </label>
                <input
                  type="text"
                  {...register("lastName")}
                  className="input input-bordered w-full bg-base-100 text-base-content"
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.lastName.message}</span>
                  </label>
                )}
              </div>

              {/* Email */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  {...register("email")}
                  required
                  className={`input input-bordered w-full bg-base-100 text-base-content ${id ? 'read-only' : ''}`}
                />
                {errors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.email.message}</span>
                  </label>
                )}
              </div>

              {/* Password */}
              {!id && (
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-base-content">Password</span>
                  </label>
                  <input
                    type="password"
                    {...register("password")}
                    className="input input-bordered w-full bg-base-100 text-base-content"
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.password.message}</span>
                    </label>
                  )}
                </div>
              )}
              {/* Class Dropdown */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Class</span>
                </label>
                <select
                  {...register("classId")}
                  className={`select select-bordered w-full bg-base-100 text-base-content ${errors.classId ? 'select-error' : ''}`}
                >
                  <option value="">Select a class</option>
                  {classes.map((classItem) => (
                    <option key={classItem._id} value={classItem._id} className="text-base-content bg-base-100">
                      {classItem.classNumber}
                    </option>
                  ))}
                </select>
                {errors.classId && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.classId.message}</span>
                  </label>
                )}
              </div>

              {/* Section Dropdown */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Section</span>
                </label>
                <select
                  {...register("sectionId")}
                  className={`select select-bordered w-full bg-base-100 text-base-content ${errors.sectionId ? 'select-error' : ''}`}
                >
                  <option value="">Select a section</option>
                  {sections.map((section) => (
                    <option key={section._id} value={section._id} className="text-base-content bg-base-100">
                      {section.section}
                    </option>
                  ))}
                </select>
                {errors.sectionId && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.sectionId.message}</span>
                  </label>
                )}
              </div>

              {/* Date Joined */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Date Joined</span>
                </label>
                <input
                  type="date"
                  {...register("dateJoined")}
                  className="input input-bordered w-full bg-base-100 text-base-content"
                  placeholder="Enter date joined"
                />
                {errors.dateJoined && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.dateJoined.message}</span>
                  </label>
                )}
              </div>

              {/* Address */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Address</span>
                </label>
                <textarea
                  {...register("address")}
                  className="textarea textarea-bordered w-full bg-base-100 text-base-content h-24"
                  placeholder="Enter address"
                />
                {errors.address && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.address.message}</span>
                  </label>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="error"
                outline
                onClick={() => router.push('/manage-student')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                outline
              >
                {id ? 'Update Student' : 'Add Student'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}