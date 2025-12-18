import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes } from 'react-router-dom';

import React, { useEffect, useState } from 'react';
import { Test_api } from './api/User_Api';  //api 불러온거 사용하기 위한 코드 테스트용
import TestView from './components/UserView';

import Header from './components/common/Header.jsx'
import Footer from './components/common/Footer.jsx'
import Main from './components/Main.jsx'
import Login from './components/userbasic/Login.jsx'
import Signup from './components/userbasic/Signup.jsx'
import Mypage from './components/userbasic/Mypage.jsx'
import Pay from './components/userbasic/Pay.jsx'
import Detail from './components/Detail.jsx'


function App() {
    const [test, setTest] = useState('');
        useEffect(() => {
        const loadTest = async () => {
            const data = await Test_api(); // 비동기  호출
            setTest(data.msg);            // 끝나면 state 업데이트 → 재렌더
        };
        loadTest();
    }, []);

    return (
        <>
        <Header/>
        <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/Mypage" element={<Mypage />} />
            <Route path="/Pay" element={<Pay />} />
            <Route path='/Detail' element={<Detail />} />
        </Routes>   
        <Footer/>      
        
        <TestView test={test} />
        </>
        )
}

export default App;
