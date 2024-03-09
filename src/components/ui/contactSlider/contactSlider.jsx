import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import './contactSlider.scss';
import Disclamier from './disclamier.jsx';
import { ACCESS_TOKEN, BASE_URL } from '../../global/constants/index.js';
import ContactList from './contactList.jsx';
// ======================= 스타일드 컴포넌트
const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid gray;
  margin-top: 10%;
  font-family: pretendard-semibold;
`;

const StatusTab = styled.div`
  width: 50%;
  letter-spacing: -1px;
  text-align: center;
  padding: 10px 0;
  cursor: pointer;
  color: gray;
  border-bottom: 2px solid transparent;
  transition:
    border-bottom 0.3s ease-in-out,
    color 0.3s ease-in-out;
  ${(props) => props.current && 'color: black; border-bottom: 2px solid black;'}
`;

export default function ContactSlider() {
  const navigate = useNavigate();

  const [currentSection, setCurrentSection] = useState('contact');
  const [contact, setcontact] = useState({
    title: '',
    content: '',
  });
  // const [contactList, setContactList] = useState([ ]);

  const contactList = [...Array(50)].map((_, index) => ({
    inquiryId: 1234,
    inquiryContent: '여기 사이트 접근이 어려워요' + index,
    inquiryStatus: '답변완료',
    inquirerNickname: '무거운 피자',
  }));

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
      localStorage.setItem('contactpageURL', '/contact');
      navigate('/login');
    } else {
      console.log('사용자 정보 로딩 시작');
      loadUserData();
    }
  }, [navigate]);

  const loadUserData = () => {
    fetch(`${BASE_URL}/api/inquiry/inquiry`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('내 문의 내역:', data);
        // setContactList(data.data);
      })
      .catch((error) => console.error('회원 정보 불러오기 실패:', error));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setcontact((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  return (
    <div className="slider-container">
      <StatusBar>
        <StatusTab
          current={currentSection === 'contact'}
          onClick={() => setCurrentSection('contact')}
        >
          문의 하기
        </StatusTab>
        <StatusTab
          current={currentSection === 'contactList'}
          onClick={() => setCurrentSection('contactList')}
        >
          문의 내역 확인
        </StatusTab>
      </StatusBar>
      {currentSection === 'contact' && (
        <div>
          <div className="contact-container">
            <div className="contact-item">
              <span className="contact-count">1</span>
              전체 문의
            </div>
            <div className="contact-item">
              <span className="contact-count">1</span>
              답변 완료
            </div>
            <div className="contact-item">
              <span className="contact-count">1</span>
              답변 대기
            </div>
          </div>
          <Disclamier />

          <div>
            <input
              type="text"
              className="input-field-contact"
              placeholder="제목을 입력해주세요. (20자 이내)"
              name="title"
              value={contact.title}
              onChange={handleChange}
            />
            <textarea
              type="text"
              className="textarea-field-contact"
              placeholder="문의 내용을 입력해주세요."
              name="content"
              value={contact.content}
              onChange={handleChange}
            />
            <button
              type="submit"
              className="submit-contact"
              disabled={contact.title === '' || contact.content === ''}
              onClick={() => alert('제출 완료')}
            >
              제출
            </button>
          </div>
        </div>
      )}
      {currentSection === 'contactList' && (
        <ContactList contactList={contactList} />
      )}
    </div>
  );
}