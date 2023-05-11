import React, { useState, useEffect } from "react";
import {useSession} from "next-auth/react"
import TodoItem_admin from "@/components/TodoItem_admin";
import styles from "@/styles/TodoList.module.css";

import {db} from "@/firebase";
import {
  collection,
  query,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  where,
  deleteField,
} from "firebase/firestore"

const todoCollection = collection(db, "todos");




// TodoList 컴포넌트를 정의합니다.
const TodoList_admin = () => {
  // 상태를 관리하는 useState 훅을 사용하여 할 일 목록과 입력값을 초기화합니다.
  const [todos, setTodos] = useState([]);
  const { data } = useSession();

  const getTodos = async () => {
    
    if (!data?.user?.id) return;

    const q = query(
      todoCollection,
      orderBy("userName", "asc")
    );

    const results = await getDocs(q);
    const newTodos = [];

    results.docs.forEach((doc) => {
      newTodos.push({id: doc.id, ...doc.data() });
    });

    setTodos(newTodos);
  };

  useEffect (()=> {
    getTodos();
  },[data]);

  
  const borderStyle = " text-center border border-blue-500 rounded ";
 

  // addTodo 함수는 입력값을 이용하여 새로운 할 일을 목록에 추가하는 함수입니다.
  // 컴포넌트를 렌더링합니다.
  return (
    <div className={styles.container}>
      <h1 className="text-xl mb-4 font-bold underline underline-offset-4 decoration-wavy">
        Admin's page : {data?.user?.name}
      </h1>
      {/* 할 일을 입력받는 텍스트 필드입니다. */}

      {/* 할 일을 추가하는 버튼입니다. */}

      <li className="mb-1">
        <div className={`${borderStyle} w-24`}>사용자</div>
        <div className={`${borderStyle} ml-2 w-48`}>할 일</div>
        <div className={`${borderStyle} ml-2 w-24`}>카테고리</div>
        <div className={`${borderStyle} ml-2 w-24`}>시작시각</div>
        <div className={`${borderStyle} ml-2 w-24`}>종료시각</div>
        <div className={`${borderStyle} ml-2 w-24`}>등록일</div>
      </li>

      {/* 할 일 목록을 렌더링합니다. */}
      <ul>
        {todos.map((todo) => (
          <TodoItem_admin
            key={todo.id}
            todo={todo}
          />
        ))}
      </ul>
    </div>
  );
}

export default TodoList_admin;