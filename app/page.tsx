'use client'

import { useEffect, useState } from 'react'

import {
  LayoutDashboard,
  Users,
  DollarSign,
  GraduationCap,
  Menu,
  MessageCircle,

  ClipboardCheck,
  FileText,
  UsersRound,
  UserPlus,
  Settings,
  HelpCircle
} from 'lucide-react'

import { supabase } from '@/lib/supabase'

export default function Home() {

const [reportTab, setReportTab] =
  useState('students')

const [openCall, setOpenCall] =
  useState<number | null>(null)  

const [callDate, setCallDate] =
  useState(
    new Date()
      .toISOString()
      .split('T')[0]
  )
const [callTime, setCallTime] =
  useState(

    new Date()
      .toLocaleTimeString(
        'pt-BR',
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      )

  )
const [observation, setObservation] = useState('')
const [selectedStudents, setSelectedStudents] = useState<number[]>([])  

const today =
  new Date()
    .toISOString()
    .split('T')[0]  

const [attendance, setAttendance] =
  useState<any[]>([])  

const [editingStudent, setEditingStudent] =
  useState<any>(null)

const [editName, setEditName] =
  useState('')

const [email, setEmail] =
  useState('')

const [password, setPassword] =
  useState('')

  const [logged, setLogged] =
    useState(false)

  const [activeTab, setActiveTab] =
  useState('dashboard')
  
  const [students, setStudents] =
  useState<any[]>([])

const [newStudent, setNewStudent] =
  useState('')

const [selectedGroup, setSelectedGroup] =
  useState('')  

const [attendanceGroup, setAttendanceGroup] =
  useState('')  

const [reportGroup, setReportGroup] =
  useState('')  

const [photo, setPhoto] =
  useState<File | null>(null)

const [search, setSearch] =
  useState('')  

const [teachers, setTeachers] =
  useState([
    'Carlos Henrique',
    'Fernanda Lima',
  ])

const [groups, setGroups] =
  useState<any[]>([])

const [newGroup, setNewGroup] =
  useState('')

const [newTeacher, setNewTeacher] =
  useState('')

const [teacherSearch, setTeacherSearch] =
  useState('')    

const [openObservation, setOpenObservation] =
  useState<number | null>(null)

const [studentObservation, setStudentObservation] =
  useState<{ [key: number]: string }>({})  

function toggleStudent(id: number) {

  if (selectedStudents.includes(id)) {

    setSelectedStudents(
      selectedStudents.filter(
        item => item !== id
      )
    )

  } else {

    setSelectedStudents([
      ...selectedStudents,
      id
    ])

  }

}  

async function loadStudents() {

  const { data } = await supabase
    .from('students')
    .select('*')
    .order('id', {
      ascending: false,
    })

  if (data) {

    setStudents(data)

  }

} 

useEffect(() => {

  loadAttendance()

  loadStudents()

  loadGroups()

}, [])

async function loadGroups() {

  const { data } =
    await supabase
      .from('groups')
      .select('*')
      .order('id', {
        ascending: false
      })

  if (data) {

    setGroups(data)

  }

}

async function markAttendance(
  student: any
) { 

   const { data: existing } =
    await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', student.id)
      .gte(
        'created_at',
        `${today}T00:00:00`
      )
      .lte(
        'created_at',
        `${today}T23:59:59`
      )

  if (
    existing &&
    existing.length > 0
  ) {

    alert(
      'Aluno já possui presença hoje.'
    )

    return

  }

  await supabase
    .from('attendance')
    .insert([
  {
    student_id: student.id,
    student_name: student.name,
    student_photo: student.photo,
    present: true
  }
])

  loadAttendance()

}

async function removeAttendance(
  studentId: number
) {

  const today =
    new Date()
      .toISOString()
      .split('T')[0]

  const { data } =
    await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .gte(
        'created_at',
        `${today}T00:00:00`
      )
      .lte(
        'created_at',
        `${today}T23:59:59`
      )

  if (!data || data.length === 0)
    return

  for (const item of data) {

    await supabase
      .from('attendance')
      .delete()
      .eq('id', item.id)

  }

  loadAttendance()

}

async function loadAttendance() {

  const { data } =
    await supabase
      .from('attendance')
      .select('*')

  if (data) {

    setAttendance(data)

  }

}

async function addStudent() {

  if (!newStudent || !selectedGroup) {

  alert('Selecione uma turma')

  return

}

  let photoUrl = ''

  if (photo) {

    const fileName =
  `${Date.now()}.jpg`

    const {
  data,
  error,
} = await supabase
  .storage
  .from('students')
  .upload(
    fileName,
    photo,
    {
      contentType:
        photo.type,
        upsert: true,
      }
)

if (error) {

  return

}

    if (data) {

      const { data: publicUrlData } =
  supabase
    .storage
    .from('students')
    .getPublicUrl(fileName)

photoUrl =
  publicUrlData.publicUrl

    }

  }

  await supabase
  .from('students')
  .insert([
    {
      name: newStudent,
      photo: photoUrl,
      group: selectedGroup,
    },
  ])

  setNewStudent('')
  setPhoto(null)
  setSelectedGroup('')

  loadStudents()

}

async function updateStudent() {

  if (!editingStudent) return

  await supabase
    .from('students')
    .update({
      name: editName,
    })
    .eq('id', editingStudent.id)

  setEditingStudent(null)

  setEditName('')

  loadStudents()

}

async function removeStudent(id: number) {

  await supabase
    .from('students')
    .delete()
    .eq('id', id)

  loadStudents()

}

function addTeacher() {

  if (!newTeacher) return

  setTeachers([
    ...teachers,
    newTeacher,
  ])

  setNewTeacher('')
} 

async function handleLogin() {

  const { error } = await supabase.auth.signInWithPassword({

    email,
    password,

  })

  if (error) {

    alert('Email ou senha inválidos')

    return

  }

  setLogged(true)

}

async function saveAttendance() {

  for (const student of students) {

    const absent =
      selectedStudents.includes(
        student.id
      )

    await supabase
      .from('attendance')
      .insert([

        {
          student_id: student.id,

          student_name: student.name,

          student_photo: student.photo,

          present: !absent,

          observation:
            studentObservation[
              student.id
            ] || '',

          call_date: callDate,

          call_time: callTime,

          group_name: attendanceGroup,

        },

      ])

  }

  alert('Chamada salva com sucesso!')

  loadAttendance()

}  

async function addGroup() {

  if (!newGroup) return

  await supabase
    .from('groups')
    .insert([
      {
        name: newGroup
      }
    ])

  setNewGroup('')

  loadGroups()

}

if (!logged) {

    return (

      <div className="
        min-h-screen
        bg-gray-100
        flex
        items-center
        justify-center
        p-6
      ">

        <div className="
          bg-white
          rounded-3xl
          shadow-2xl
          p-8
          w-full
          max-w-md
        ">

          <h1 className="
            text-lg
            font-bold
            text-center
            mb-2
          ">
            Instituto Santa Cruz
          </h1>

          <p className="
            text-center
            text-gray-500
            mb-8
          ">
            Plataforma de Gestão
          </p>

          <div className="space-y-4">

            <input
  type="email"

  value={email}

  onChange={(e) =>
    setEmail(e.target.value)
  }

  placeholder="E-mail"

  className="
    w-full
    border
    rounded-2xl
    p-4
  "
/>

            <input
  type="password"

  value={password}

  onChange={(e) =>
    setPassword(e.target.value)
  }

  placeholder="Senha"

  className="
    w-full
    border
    rounded-2xl
    p-4
  "
/>

<button
  type="button"

  onClick={handleLogin}

              className="
                w-full
                bg-blue-600
                text-white
                rounded-2xl
                p-4
                font-bold
              "
            >
              Entrar no Sistema
            </button>

          </div>

        </div>

      </div>

    )
  }

  return (

    <div className="
  w-full
  min-h-screen
  px-6
">

<div className="
  flex
  gap-6
">

<main className="flex-1">

      <div className="
        max-w-7xl
        mx-auto
        space-y-6
      ">

        <div className="
  w-full
">

          <div className="
  flex
  items-center
  gap-4
">

  {activeTab !== 'dashboard' && (

    <button

      onClick={() =>
        setActiveTab('dashboard')
      }

      className="
        text-lg
        font-bold
      "
    >
      ←
    </button>

  )}

  <h1 className="
    text-lg
    font-bold
  ">

    {activeTab === 'dashboard' && 'Início'}

    {activeTab === 'students' && 'Alunos'}

    {activeTab === 'teachers' && 'Professores'}

    {activeTab === 'attendance' && 'Chamada'}

    {activeTab === 'calendar' && 'Relatório'}

    {activeTab === 'financial' && 'Financeiro'}

  </h1>

</div>

          <p className="
            text-gray-500
            mt-2
          ">
            Controle total da instituição em um só lugar 🚀
          </p>

        </div>

{activeTab === 'dashboard' && (

  <div className="
    grid
    grid-cols-2
    w-full
    gap-2
    bg-white
    text-white
    rounded-b-3xl
    overflow-hidden
    shadow-xl
  ">

<button
      onClick={() => setActiveTab('students')}
      className="
        h-56
        border

        hover:bg-emerald-50
        hover:scale-105
        hover:shadow-2xl
        cursor-pointer

        flex
        flex-col
        items-center
        justify-center
        gap-6
      "
    >
      <UserPlus
        size={90}
        className="text-emerald-700"
      />

      <span className="
        text-lg
        font-bold
        text-emerald-700
      ">
        Alunos
      </span>
    </button>

<button
    onClick={() =>
  setActiveTab('groups')
}
      className="
        h-56
        border

        hover:bg-emerald-50
        hover:scale-105
        hover:shadow-2xl
        cursor-pointer

        flex
        flex-col
        items-center
        justify-center
        gap-6
      "
    >
      <UsersRound
        size={90}
        className="text-emerald-700"
      />

      <span className="
        text-lg
        font-bold
        text-emerald-700
      ">
        Turmas
      </span>
    </button>

    <button
      onClick={() => setActiveTab('attendance')}
      className="
        h-56
        border

        hover:bg-emerald-50
        hover:scale-105
        hover:shadow-2xl
        cursor-pointer

        flex
        flex-col
        items-center
        justify-center
        gap-6
      "
    >
      <ClipboardCheck
        size={90}
        className="text-emerald-700"
      />

      <span className="
        text-lg
        font-bold
        text-emerald-700
      ">
        Chamada
      </span>
    </button>

    <button
      onClick={() => setActiveTab('calendar')}
      className="
        h-56
        border

        hover:bg-emerald-50
        hover:scale-105
        hover:shadow-2xl
        cursor-pointer

        flex
        flex-col
        items-center
        justify-center
        gap-6
      "
    >
      <FileText
        size={90}
        className="text-emerald-700"
      />

      <span className="
        text-lg
        font-bold
        text-emerald-700
      ">
        Relatórios
      </span>
    </button>

<button

  onClick={() =>
    setActiveTab('teachers')
  }

  className="
        h-56
        border

        hover:bg-emerald-50
        hover:scale-105
        hover:shadow-2xl
        cursor-pointer

        flex
        flex-col
        items-center
        justify-center
        gap-6
      "
    >
      <GraduationCap
  size={90}
  className="text-emerald-700"
/>

<span className="
  text-lg
  font-bold
  text-emerald-700
">
  Professores
</span>
    </button>

    <button
  onClick={() => setActiveTab('financial')}

      className="
        h-56
        border

        hover:bg-emerald-50
        hover:scale-105
        hover:shadow-2xl
        cursor-pointer

        flex
        flex-col
        items-center
        justify-center
        gap-6
      "
    >
      <DollarSign
  size={90}
  className="text-emerald-700"
/>

<span className="
  text-lg
  font-bold
  text-emerald-700
">
  Financeiro
</span>

    </button>

  </div>

)}

{activeTab === 'students' && (

  <div className="
    bg-white
    rounded-3xl
    shadow-xl
    p-8
  ">

    <div className="
      flex
      items-center
      justify-between
      mb-6
    ">

      <div>

  <h2 className="
    text-xl
    font-bold
  ">
    Alunos
  </h2>

  <p className="
    text-gray-500
    mt-1
  ">
    {students.length} alunos cadastrados
  </p>

</div>

      <button
        className="
          bg-blue-600
          text-white
          px-6
          py-3
          rounded-2xl
          font-semibold
        "
      >
        Novo Aluno
      </button>

    </div>

    <div className="space-y-4">

<input
  value={search}

  onChange={(e) =>
    setSearch(e.target.value)
  }

  placeholder="Pesquisar aluno"

  className="
    w-full
    border
    rounded-2xl
    p-4
    mb-6
  "
/>

      <div className="
  flex
  gap-4
  mb-6
">

  <input
    value={newStudent}

    onChange={(e) =>
      setNewStudent(
        e.target.value
      )
    }

    placeholder="Nome do aluno"

    className="
      flex-1
      border
      rounded-2xl
      p-4
    "
  />

<select

  value={selectedGroup}

  onChange={(e) =>
    setSelectedGroup(
      e.target.value
    )
  }

  className="
    border
    rounded-2xl
    p-4
  "
>

  <option value="">
    Turma
  </option>

  {groups.map((group: any) => (

    <option
      key={group.id}
      value={group.name}
    >

      {group.name}

    </option>

  ))}

</select>

  <input
  type="file"

  accept="image/*"

  onChange={(e) => {

    if (!e.target.files) return

    setPhoto(
      e.target.files[0]
    )

  }}

  className="
    border
    rounded-2xl
    p-3
  "
/>

  <button
    onClick={addStudent}

    className="
      bg-blue-600
      text-white
      px-6
      rounded-2xl
      font-semibold
    "
  >
    Adicionar
  </button>

</div>

<div className="space-y-4">

  {students
  .filter((student: any) =>
    student.name
      .toLowerCase()
      .includes(
        search.toLowerCase()
      )
  )

  .map((student: any) => (

    <div
      key={student.name}

      className="
        border
        rounded-2xl
        p-4

        flex
        items-center
        justify-between
      "
    >

      <div className="
  flex
  items-center
  gap-4
">

{student.photo ? (

  <img
    src={student.photo}

    alt={student.name}

    className="
      w-12
      h-12
      rounded-full
      object-cover
    "
  />

) : (

  <div className="
    w-12
    h-12
    rounded-full
    bg-blue-600
    text-white

    flex
    items-center
    justify-center

    font-bold
  ">

    {student.name.charAt(0)}

  </div>

)}  
  <span className="font-semibold">
    {student.name}
  </span>

</div>

<button

  onClick={() => {

    setEditingStudent(student)

    setEditName(student.name)

  }}

  className="
    text-blue-600
    font-bold
    mr-4
  "
>

  Editar

</button>

      <button
        onClick={() =>
  removeStudent(student.id)
}
        className="
          text-red-500
          font-semibold
        "
      >
        Excluir
      </button>

    </div>

  ))}

</div>

    </div>

  </div>

)}        

{activeTab === 'groups' && (

  <div className="
    bg-white
    rounded-3xl
    shadow-xl
    p-8
  ">

    <div className="
      flex
      justify-between
      items-center
      mb-8
    ">

      <div>

        <h2 className="
          text-xl
          font-bold
        ">
          Turmas
        </h2>

        <p className="
          text-gray-500
          mt-1
        ">
          {groups.length} turmas cadastradas
        </p>

      </div>

    </div>

    <div className="
      flex
      gap-4
      mb-8
    ">

      <input

        value={newGroup}

        onChange={(e) =>
          setNewGroup(e.target.value)
        }

        placeholder="Nome da turma"

        className="
          flex-1
          border
          rounded-2xl
          p-4
        "
      />

      <button

        onClick={addGroup}

        className="
          bg-emerald-700
          text-white
          px-6
          rounded-2xl
          font-bold
        "
      >

        Adicionar

      </button>

    </div>

    <div className="space-y-4">

      {groups.map((group: any) => (

        <div

          key={group.id}

          className="
            border
            rounded-2xl
            p-6

            flex
            justify-between
            items-center
          "
        >

          <h3 className="
            text-lg
            font-bold
          ">

            {group.name}

          </h3>

          <button

            onClick={() =>
              setGroups(
                groups.filter(
                  (g) =>
                    g.id !== group.id
                )
              )
            }

            className="
              text-red-500
              font-bold
            "
          >

            Excluir

          </button>

        </div>

      ))}

    </div>

  </div>

)}

{activeTab === 'teachers' && (

  <div className="
    bg-white
    rounded-3xl
    shadow-xl
    p-8
  ">

    <div className="
      flex
      items-center
      justify-between
      mb-6
    ">

      <div>

        <h2 className="
          text-xl
          font-bold
        ">
          Professores
        </h2>

        <p className="
          text-gray-500
          mt-1
        ">
          {teachers.length} professores cadastrados
        </p>

      </div>

    </div>

    <input
      value={teacherSearch}

      onChange={(e) =>
        setTeacherSearch(
          e.target.value
        )
      }

      placeholder="Pesquisar professor"

      className="
        w-full
        border
        rounded-2xl
        p-4
        mb-6
      "
    />

    <div className="
      flex
      gap-4
      mb-6
    ">

      <input
        value={newTeacher}

        onChange={(e) =>
          setNewTeacher(
            e.target.value
          )
        }

        placeholder="Nome do professor"

        className="
          flex-1
          border
          rounded-2xl
          p-4
        "
      />

      <button
        onClick={addTeacher}

        className="
          bg-blue-600
          text-white
          px-6
          rounded-2xl
          font-semibold
        "
      >
        Adicionar
      </button>

    </div>

    <div className="space-y-4">

      {teachers

        .filter((teacher) =>
          teacher
            .toLowerCase()
            .includes(
              teacherSearch.toLowerCase()
            )
        )

        .map((teacher) => (

          <div
            key={teacher}

            className="
              border
              rounded-2xl
              p-4

              flex
              items-center
              justify-between
            "
          >

            <div className="
              flex
              items-center
              gap-4
            ">

              <div className="
                w-12
                h-12
                rounded-full
                bg-green-600
                text-white

                flex
                items-center
                justify-center

                font-bold
              ">

                {teacher.charAt(0)}

              </div>

              <span className="
                font-semibold
              ">
                {teacher}
              </span>

            </div>

            <button
              onClick={() =>
                setTeachers(
                  teachers.filter(
                    (t) => t !== teacher
                  )
                )
              }

              className="
                text-red-500
                font-semibold
              "
            >
              Excluir
            </button>

          </div>

      ))}

    </div>

  </div>

)}

{activeTab === 'attendance' && (

  <div className="
    bg-white
    rounded-3xl
    p-8
    shadow-lg
    w-full
    max-w-5xl
  ">

    <h1 className="
      text-lg
      font-bold
      mb-8
    ">

      📋 Nova chamada

    </h1>

<div className="
  mb-8
">

  <select

    value={attendanceGroup}

    onChange={(e) =>
      setAttendanceGroup(
        e.target.value
      )
    }

    className="
      border
      rounded-2xl
      p-4
      w-full
      max-w-md
    "
  >

    <option value="">
      Selecionar turma
    </option>

    {groups.map((group: any) => (

      <option
        key={group.id}
        value={group.name}
      >

        {group.name}

      </option>

    ))}

  </select>

</div>    

    <div className="
      grid
      grid-cols-3
      gap-6
      mb-8
    ">

      <div>

        <p className="
          text-gray-500
          mb-2
        ">
          Data chamada
        </p>

        <input
          type="date"
          value={callDate}
          onChange={(e) =>
            setCallDate(e.target.value)
          }
          className="
            border
            rounded-2xl
            p-4
            w-full
          "
        />

      </div>

      <div>

        <p className="
          text-gray-500
          mb-2
        ">
          Hora chamada
        </p>

        <input
          type="time"
          value={callTime}
          onChange={(e) =>
            setCallTime(e.target.value)
          }
          className="
            border
            rounded-2xl
            p-4
            w-full
          "
        />

      </div>

      <div className="
        flex
        items-end
      ">

        <button

onClick={saveAttendance}

          className="
            bg-green-600
            text-white
            px-8
            py-4
            rounded-2xl
            font-bold
            shadow-lg
          "
        >

          Salvar

        </button>

      </div>

    </div>

    <textarea

      placeholder="
        Digite uma observação...
      "

      value={observation}

      onChange={(e) =>
        setObservation(
          e.target.value
        )
      }

      className="
        border
        rounded-2xl
        p-4
        w-full
        h-32
        mb-8
      "
    />

    <p className="
      text-center
      text-green-700
      font-bold
      mb-8
    ">

      Obs: Marque os AUSENTES

    </p>

    <div className="
      space-y-4
    ">

      {students

  .filter(

    (student: any) =>

      attendanceGroup === ''

      ||

      student.group ===
      attendanceGroup

  )

  .map((student: any) => {

        const checked =
          selectedStudents.includes(
            student.id
          )

        return (

          <div

            key={student.id}

            className="
              border
              rounded-2xl
              p-6

              flex
              items-center
              justify-between
            "
          >

            <div className="
              flex
              items-center
              gap-4
            ">

              <input
                type="checkbox"

                checked={checked}

                onChange={() =>
                  toggleStudent(
                    student.id
                  )
                }

                className="
                  w-6
                  h-6
                "
              />

              <img
                src={student.photo}
                className="
                  w-14
                  h-14
                  rounded-full
                  object-cover
                "
              />

              <span className="
                text-lg
                font-semibold
              ">

                {student.name}

              </span>

            </div>

<div className="relative">

  <button

    onClick={() =>

      setOpenObservation(

        openObservation === student.id
          ? null
          : student.id

      )

    }

    className="
      bg-gray-100
      hover:bg-gray-200

      p-3
      rounded-full

      transition
    "
  >

    <MessageCircle size={22} />

  </button>

  {openObservation === student.id && (

    <div className="
      absolute
      right-0
      top-16

      bg-white
      border
      shadow-2xl

      rounded-2xl
      p-4

      w-72
      z-50
    ">

      <textarea

        value={
          studentObservation[
            student.id
          ] || ''
        }

        onChange={(e) =>

          setStudentObservation({

            ...studentObservation,

            [student.id]:
              e.target.value

          })

        }

        placeholder="
          Digite uma observação...
        "

        className="
          w-full
          border
          rounded-xl
          p-3
          h-28
        "
      />

    </div>

  )}

</div>            

          </div>

        )

      })}

    </div>

  </div>

)}  

{activeTab === 'financial' && (

  <div className="
    bg-white
    rounded-3xl
    shadow-xl
    p-8
  ">

    <h2 className="
      text-xl
      font-bold
      mb-6
    ">
      Financeiro
    </h2>

    <div className="
      grid
      md:grid-cols-3
      gap-6
    ">

      <div className="
        bg-green-100
        rounded-2xl
        p-6
      ">
        Receitas
      </div>

      <div className="
        bg-red-100
        rounded-2xl
        p-6
      ">
        Despesas
      </div>

      <div className="
        bg-blue-100
        rounded-2xl
        p-6
      ">
        Saldo
      </div>

    </div>

  </div>

)}

{activeTab === 'calendar' && (

<div className="
  bg-white
  rounded-3xl
  shadow-xl
  overflow-hidden
  w-full
  max-w-7xl
">

  <div className="
    bg-emerald-700
    text-white
    p-8
">

    <h1 className="
      text-lg
      font-bold
      mb-6
    ">

      Relatório

    </h1>

<div className="
  mb-6
">

  <select

    value={reportGroup}

    onChange={(e) =>
      setReportGroup(
        e.target.value
      )
    }

    className="
  border
  rounded-2xl
  p-4
  text-black
  bg-white

  w-full
  max-w-md
"
  >

    <option value="">
      Todas as turmas
    </option>

    {groups.map((group: any) => (

      <option
        key={group.id}
        value={group.name}
      >

        {group.name}

      </option>

    ))}

  </select>

</div>    

<div className="
  flex
  gap-16
  text-lg
  font-semibold
">

  <button

    onClick={() =>
      setReportTab('students')
    }

    className={`
      pb-2

      ${
        reportTab === 'students'
          ? 'border-b-4 border-white'
          : ''
      }
    `}
  >

    ALUNOS

  </button>

  <button

    onClick={() =>
      setReportTab('calls')
    }

    className={`
      pb-2

      ${
        reportTab === 'calls'
          ? 'border-b-4 border-white'
          : ''
      }
    `}
  >

    CHAMADAS

  </button>

</div>

  </div>

{reportTab === 'students' && (

  <div>

    {students

  .filter(

    (student: any) =>

      reportGroup === ''

      ||

      student.group ===
      reportGroup

  )

  .map((student: any, index: number) => {

      const studentAttendance =
        attendance.filter(
          (item: any) =>

            item.student_id ===
            student.id
        )

      const presents =
        studentAttendance.filter(
          (item: any) =>
            item.present
        ).length

      const absences =
        studentAttendance.filter(
          (item: any) =>
            !item.present
        ).length

      const total =
        presents + absences

      const presentPercent =
        total > 0
          ? Math.round(
              (presents / total) * 100
            )
          : 0

      const absencePercent =
        total > 0
          ? Math.round(
              (absences / total) * 100
            )
          : 0

      return (

        <div

          key={student.id}

          className="
            flex
            justify-between
            items-center
            gap-10

            p-8

            border-b
          "
        >

          <div className="
            flex
            items-center
            gap-5
          ">

            <span className="
              text-xl
              font-bold
              text-gray-700
            ">

              {index + 1}.

            </span>

            <img
              src={student.photo}
              className="
                w-16
                h-16
                rounded-full
                object-cover
              "
            />

            <h2 className="
              text-xl
              font-bold
            ">

              {student.name}

            </h2>

          </div>

          <div className="
  flex
  flex-col
  items-end
  gap-2
  min-w-[220px]
">

  <div className="
    flex
    items-center
    gap-3
    text-lg
  ">

    <span className="
      text-gray-600
    ">
      Presenças:
    </span>

    <span className="
      font-bold
    ">
      {presents}
    </span>

    <span className="
      text-green-600
      font-bold
    ">
      {presentPercent}%
    </span>

  </div>

  <div className="
    flex
    items-center
    gap-3
    text-lg
  ">

    <span className="
      text-gray-600
    ">
      Faltas:
    </span>

    <span className="
      font-bold
    ">
      {absences}
    </span>

    <span className="
      text-red-600
      font-bold
    ">
      {absencePercent}%
    </span>

  </div>

</div>

        </div>

      )

    })}

  </div>

  )}

{reportTab === 'calls' && (

  <div className="p-6 space-y-6">

    {[
  ...new Map(

    attendance
    
    .filter(

  (item: any) =>

    reportGroup === ''

    ||

    item.group_name ===
    reportGroup

)

    .map((item: any) => [

      `${item.call_date}-${item.call_time}`,

      item

    ])

  ).values()

].map((call: any) => (

      <div
        key={call.id}

        className="
          bg-white
          rounded-2xl
          shadow-md
          overflow-hidden
        "
      >

        <button

          onClick={() =>

            setOpenCall(

              openCall === call.id
                ? null
                : call.id

            )

          }

          className="
            w-full
            flex
            justify-between
            items-center

            p-6
          "
        >

          <div className="
            flex
            items-center
            gap-5
          ">

            <span className="
              text-xl
            ">
              ⌄
            </span>

            <h2 className="
              text-xl
              font-bold
            ">

              {new Date(call.call_date).toLocaleDateString('pt-BR')}
              {' '}
              {call.call_time}

              <span className="
  text-lg
  text-gray-500
  ml-4
">

  Turma:
  {call.group_name}

</span>

            </h2>

          </div>

        </button>

        {openCall === call.id && (

<div className="
  border-t
  bg-white
">

  {attendance

    .filter(

      (item: any) =>

        item.call_date ===
        call.call_date

        &&

        item.call_time ===
        call.call_time

    )

    .map((studentCall: any, index: number) => (

      <div

        key={studentCall.id}

        className="
  p-6

  flex
  justify-between
  items-center

  gap-8

  border-b
"
      >

        <div className="
  flex
  items-center
  gap-5
  flex-1
">

          <span className="
            text-lg
            font-bold
          ">

            {index + 1}.

          </span>

          <img
            src={studentCall.student_photo}
            className="
              w-14
              h-14
              rounded-full
              object-cover
            "
          />

          <h3 className="
  text-lg
  font-bold
  min-w-[140px]
  text-black
">

            {studentCall.student_name}

          </h3>

        </div>

        <span
          className={`

            min-w-[120px]
            text-right

            text-lg
            font-bold

            ${
              studentCall.present
                ? 'text-green-600'
                : 'text-red-600'
            }
          `}
        >

          {
            studentCall.present
              ? 'Presente'
              : 'Ausente'
          }

        </span>

      </div>

    ))}

</div>

        )}

      </div>

    ))}

  </div>

)}  

</div>

)}

      </div>

      </main>

</div>

<nav

  className="
    fixed
    bottom-0
    left-0
    w-full
    bg-white
    border-t
    shadow-2xl

    flex
    items-center
    justify-around

    py-3

    md:hidden
  "
>

  <button
    onClick={() =>
      setActiveTab('dashboard')
    }

    className="
      flex
      flex-col
      items-center
      text-sm
      font-semibold
    "
  >
    <LayoutDashboard size={24} />
    Dashboard
  </button>

  <button
    onClick={() =>
      setActiveTab('students')
    }

    className="
      flex
      flex-col
      items-center
      text-sm
      font-semibold
    "
  >
    <Users size={24} />
    Alunos
  </button>

  <button
    onClick={() =>
      setActiveTab('financial')
    }

    className="
      flex
      flex-col
      items-center
      text-sm
      font-semibold
    "
  >
    <DollarSign size={24} />
    Financeiro
  </button>

  <button
    onClick={() =>
      setActiveTab('teachers')
    }

    className="
      flex
      flex-col
      items-center
      text-sm
      font-semibold
    "
  >
    <GraduationCap size={24} />
    Professores
  </button>

</nav>

{editingStudent && (

  <div className="
    fixed
    inset-0
    bg-black/40

    flex
    items-center
    justify-center

    z-50
  ">

    <div className="
      bg-white
      p-8
      rounded-3xl
      w-[400px]

      space-y-4
    ">

      <h2 className="
        text-lg
        font-bold
      ">

        Editar aluno

      </h2>

      <input
        value={editName}

        onChange={(e) =>
          setEditName(e.target.value)
        }

        className="
          w-full
          border
          rounded-2xl
          p-4
        "
      />

      <div className="
        flex
        gap-4
      ">

        <button

          onClick={updateStudent}

          className="
            flex-1
            bg-blue-600
            text-white
            p-4
            rounded-2xl
            font-bold
          "
        >

          Salvar

        </button>

        <button

          onClick={() =>
            setEditingStudent(null)
          }

          className="
            flex-1
            bg-gray-200
            p-4
            rounded-2xl
            font-bold
          "
        >

          Cancelar

        </button>

      </div>

    </div>

  </div>  

)}

    </div>

  )
}