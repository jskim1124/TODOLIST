import React, { useState, useEffect } from "react";
import {useSession} from "next-auth/react"
import TodoItem from "@/components/TodoItem";
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
const TodoList = () => {
  // 상태를 관리하는 useState 훅을 사용하여 할 일 목록과 입력값을 초기화합니다.
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [errorcode, seterrorcode] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [category, setCategory] = useState("");
  const [stime, setsTime] = useState("");
  const [ftime, setfTime] = useState("");

  const { data } = useSession();

  const getTodos = async () => {
    
    if (!data?.user?.name) return;

    const q = query(
      todoCollection,
      where("userId", "==", data?.user.id),
      orderBy("Datetime", "asc")
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


  // addTodo 함수는 입력값을 이용하여 새로운 할 일을 목록에 추가하는 함수입니다.
  const addTodo = async () => {
    // 입력값이 비어있는 경우 함수를 종료합니다.
    if (input.trim() === "" || stime === "" || ftime === "" ||  new Date(`1970-01-01T${stime}`) >= new Date(`1970-01-01T${ftime}`) || category === "" ) {
      setIsButtonDisabled(true); // 버튼 비활성화
      seterrorcode("할 일과 활동 시간, 카테고리를 다시 확인하십시오")
      setTimeout(() => {
        setIsButtonDisabled(false); // 1초 후 버튼 활성화
      }, 1000);
      return;
    }    
    // 기존 할 일 목록에 새로운 할 일을 추가하고, 입력값을 초기화합니다.
    // {
    //   id: 할일의 고유 id,
    //   text: 할일의 내용,
    //   completed: 완료 여부,
    // }
    // ...todos => {id: 1, text: "할일1", completed: false}, {id: 2, text: "할일2", completed: false}}, ..
    
    const Datetime = new Date().toISOString();

    const docRef = await addDoc(todoCollection,{
      text:input,
      completed: false,
      category: category, 
      stime: stime, 
      ftime: ftime,
      Datetime : Datetime,
      userId: data?.user?.id,
    });

    // const newTodo = {id: Date.now(), text: input, completed: false, category: category, stime: stime, ftime: ftime};
    setTodos([...todos, {id:docRef.id, text:input, completed:false, category:category, stime:stime, ftime:ftime, Datetime:Datetime}]);
    setInput("");
    setCategory("");
    setsTime("");
    setfTime("");
    setIsButtonDisabled(true); // 버튼 비활성화
    seterrorcode("");
    setTimeout(() => {
      setIsButtonDisabled(false); // 버튼 활성화
    }, 1000);
  };

  // toggleTodo 함수는 체크박스를 눌러 할 일의 완료 상태를 변경하는 함수입니다.
  const toggleTodo = (id) => {
    // 할 일 목록에서 해당 id를 가진 할 일의 완료 상태를 반전시킵니다.
    const newTodos = todos.map((todo)=> {
      if (todo.id === id) {
        const todoDoc = doc(todoCollection, id);
        updateDoc(todoDoc, {completed: !todo.completed});
        return {...todo, completed: !todo.completed};
      } else{
        return todo;
      }
    });
    setTodos(newTodos);
    
    // setTodos(
    //   // todos.map((todo) =>
    //   //   todo.id === id ? { ...todo, completed: !todo.completed } : todo
    //   // )
    //   // ...todo => id: 1, text: "할일1", completed: false
    //   todos.map((todo) => {
    //     return todo.id === id ? { ...todo, completed: !todo.completed } : todo;
    //   })
      
    // );

  };

  // deleteTodo 함수는 할 일을 목록에서 삭제하는 함수입니다.
  const deleteTodo = (id) => {
    // 해당 id를 가진 할 일을 제외한 나머지 목록을 새로운 상태로 저장합니다.
    // setTodos(todos.filter((todo) => todo.id !== id));
    const todoDoc = doc(todoCollection, id);
    deleteDoc(todoDoc);
    
    setTodos(
      todos.filter((todo) => {
        return todo.id !== id;
      })
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const borderStyle = " text-center border border-blue-500 rounded ";
  


  // 컴포넌트를 렌더링합니다.
  return (
    <div className={styles.container}>
      <h1 className="text-xl mb-4 font-bold underline underline-offset-4 decoration-wavy">
        {data?.user?.name}'s Todo List
      </h1>
      {/* 할 일을 입력받는 텍스트 필드입니다. */}

      <li className="mb-1">
        <input
        type="text"
        className="shadow-lg h-8 w-full p-1 mb-4 border border-gray-300 rounded"
        style={{ width: "500%" }}
        value={input}
        placeholder="할 일을 입력하세요"
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress} 
        />
        <input
        type="time"
        className="shadow-lg h-8 w-40 p-1 text-center ml-3 mb-4 border border-gray-300 rounded"
        style={{ width: "300%" }}
        value={stime}        
        placeholder="시작 시각"
        onChange={(e) => setsTime(e.target.value)}
        onKeyPress={handleKeyPress} 
        />
        <input
        type="time"
        className="shadow-lg h-8 w-40 p-1 text-center ml-3 mb-4 border border-gray-300 rounded"
        style={{ width: "300%" }}
        value={ftime}
        placeholder="종료 시각"
        onChange={(e) => setfTime(e.target.value)}
        onKeyPress={handleKeyPress} 
        />
    
        <select
          className="shadow-lg h-8 w-24 p-1 text-center ml-3 mb-4 border border-gray-300 rounded"
          value={category}
          selected={category}
          onKeyPress={handleKeyPress} 
          onChange={(e) => {
            if (e.target.value === "other") {
              setCategory(prompt("Please enter a category"));
            } else  {
              setCategory(e.target.value);
            }
          }}
        >
          <option value="">카테고리</option>
          <option value="수행평가">수행평가</option>
          <option value="모의고사">모의고사</option>
          <option value="내신준비">내신준비</option>
          <option value="other">기타</option>
          {["수행평가","모의고사","내신준비","other",""].includes(category)? "":<option value={category}>{category}</option>}
        </select>

      </li>

      {/* 할 일을 추가하는 버튼입니다. */}
      <li>
        <span className= "w-full pl-5 text-red-500 mr-10 mb-7 ">{errorcode}</span>
        <button
          className={`w-1/5 justify-self-end p-1 mb-7 bg-blue-500 text-white border border-blue-500 rounded hover:bg-white hover:text-blue-500 ${isButtonDisabled && "bg-red-500 border-red-500 hover:bg-red hover:text-red-500 cursor-not-allowed"}`}
          onClick={addTodo}
          disabled={isButtonDisabled}
        >
          Add Todo
        </button>
      </li>

      <li className="mb-1">
        <div className={`${borderStyle} w-14`}>완료</div>
        <div className={`${borderStyle} ml-2 w-48`}>할 일</div>
        <div className={`${borderStyle} ml-2 w-24`}>카테고리</div>
        <div className={`${borderStyle} ml-2 w-24`}>시작시각</div>
        <div className={`${borderStyle} ml-2 w-24`}>종료시각</div>
        <div className={`${borderStyle} ml-2 w-24`}>등록일</div>
        <div className={`${borderStyle} ml-2 w-16`}>제거</div>
      </li>

      {/* 할 일 목록을 렌더링합니다. */}
      <ul>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={() => toggleTodo(todo.id)}
            onDelete={() => deleteTodo(todo.id)}
          />
        ))}
      </ul>
    </div>
  );
}

export default TodoList;