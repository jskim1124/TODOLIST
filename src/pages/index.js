import React, { useState } from "react";
import TodoList from "../components/TodoList";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import TodoList_admin from "@/components/TodoList_admin";
import styles from "@/styles/TodoList.module.css";

export default function Home() {
  const router = useRouter();
  const { data } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("auth/signin");
    },
  });

  const [isAdmin, setIsAdmin] = useState(false);

  const handleAdminClick = () => {
    setIsAdmin(true);
  };

  const handleUserClick = () => {
    setIsAdmin(false);
  };
  const buttonstyle= "w-1/5 p-1 bg-blue-500 text-white border border-blue-500 rounded hover:bg-white hover:text-blue-500"

  // 아이디가 2781687723일 때만 "관리자 접근" 버튼 보이기
  if (data?.user?.id === "2781687723") {
    return (
      <div>
        <div className={styles.container}>
          <span className="p-20 text-red-500"> 현 관리 권한 : {data?.user?.name}</span>
          <button 
          className={`${buttonstyle} ml-4`}
          onClick={handleUserClick}>
          사용자 접근
          </button>

          <button 
          className={`${buttonstyle} ml-2`}
          onClick={handleAdminClick}>
          관리자 접근
          </button>
        </div>
        <div>
        {isAdmin ? <TodoList_admin /> : <TodoList />}
        </div>
      </div>
    );
  }

  // 아이디가 2781687723이 아닐 때는 Todolist만 렌더링
  return (
    <div>
      <TodoList />
    </div>
  );
}