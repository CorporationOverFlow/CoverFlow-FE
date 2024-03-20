import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../../asset/sass/etc/searchInput/searchInput.scss';
import styled from 'styled-components';
import Searchicon from '../../../asset/image/searchicon.svg';

import { BASE_URL } from '../../global/constants';
import useDebounce from '../../../hooks/useDebounce';
import { conditionalExecution } from '../../../utils/utils';

const StyledSearchInput = styled.input`
  width: 350px;
  height: 40px;
  padding: 8px;
  border: 1px solid #ff8d1d;
  background-color: #f2f2f2;
  border-radius: 30px;
  margin: 5% 0% 0% 24%;
  outline: none;

  &:focus {
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  }

  &::placeholder {
    color: #c0c0c0;
    font-size: 0.8rem;
  }
`;

const AutoCompleteContainer = styled.div`
  position: absolute;
  background-color: #fefefe;
  width: 361px;
  letter-spacing: -1px;
  margin-left: 23%;
  margin-top: 1%;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  max-height: 300px;
  overflow-y: auto;
  z-index: 99;
`;

const AutoCompleteItem = styled.div`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f2f2f2;
  }
`;

interface CompanyProps {
  name: string;
  companyName: string;
}

function SearchInput() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [autoCompleteValue, setAutoCompleteValue] = useState<CompanyProps[]>(
    [],
  );
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const autoCompleteContainerRef = useRef<HTMLDivElement | null>(null);

  const debouncedKeyword = useDebounce(keyword, 300);

  // 유효한 문자열 검사 (한글, 영문, 숫자)
  // const isSyllable = (character) => {
  //   const syllableRegex = /^[가-힣a-zA-Z0-9]$/;

  //   return syllableRegex.test(character);
  // };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debouncedKeyword !== '') {
      fetchAutoCompleteData(debouncedKeyword);
    } else {
      setAutoCompleteValue([]);
    }
  }, [debouncedKeyword]);

  // 입력값 변경 핸들러
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = event.target.value.trim();
    setShowAutoComplete(true);
    setKeyword(newInputValue);
    setActiveIndex(-1);

    // if (newInputValue.length > 0) {
    //   const lastCharacter = newInputValue.slice(-1);
    //   if (isSyllable(lastCharacter)) {
    //     fetchAutoCompleteData(newInputValue);
    //   } else {
    //     setAutoCompleteValue([]);
    //   }
    // } else {
    //   setAutoCompleteValue([]);
    // }
  };

  // 자동완성 데이터 요청
  const fetchAutoCompleteData = async (name: string) => {
    try {
      const res = await axios.get<{ data: { companyList: CompanyProps[] } }>(
        `${BASE_URL}/api/company?pageNo=0&name=${name}`,
      );
      // console.log('res', res);
      setAutoCompleteValue(res.data.data.companyList);
    } catch (error) {
      console.error('자동완성 데이터 요청 실패', error);
      setAutoCompleteValue([]);
    }
  };

  const itemSearch = (params: URLSearchParams, value: string) => {
    params.append('keyword', value);
    navigate(`/search-result?${params.toString()}`);
  };

  // const fullDataSearch = (params: URLSearchParams, keyword: string) => {
  //   itemSearch(params, keyword);
  // };

  // const specificItemSeach = (params: URLSearchParams, item: string) => {
  //   itemSearch(params, item);
  // };

  // 검색 함수
  const handleCompanySearch = () => {
    const params = new URLSearchParams();
    try {
      if (activeIndex === -1) itemSearch(params, keyword);
      else if (activeIndex >= 0 && autoCompleteValue[activeIndex])
        itemSearch(params, autoCompleteValue[activeIndex].name);
    } catch (error) {
      console.error('검색 중 오류 발생', error);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        autoCompleteContainerRef.current &&
        !autoCompleteContainerRef.current.contains(e.target as Node)
      ) {
        setShowAutoComplete(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // 자동완성 선택 함수
  const selectAutoCompleteValue = (value: string) => {
    setKeyword(value);
    setAutoCompleteValue([]);
    handleCompanySearch();
  };

  const enteredKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const condition = [
      {
        test: () =>
          event.key === 'ArrowDown' &&
          activeIndex < autoCompleteValue.length - 1,
        execute: () => {
          setActiveIndex(activeIndex + 1);
        },
      },
      {
        test: () => event.key === 'ArrowUp' && activeIndex > 0,
        execute: () => {
          setActiveIndex(activeIndex - 1);
        },
      },
      {
        test: () => event.key === 'Enter',
        execute: () => {
          activeIndex >= 0 && autoCompleteValue[activeIndex]
            ? selectAutoCompleteValue(autoCompleteValue[activeIndex].name)
            : handleCompanySearch();
        },
      },
    ];

    conditionalExecution(condition);
  };

  return (
    <>
      <StyledSearchInput
        ref={inputRef}
        type="text"
        className="search-input-text"
        placeholder="기업 명을 검색하세요"
        value={keyword || ''}
        onChange={handleInputChange}
        onKeyDown={enteredKey}
      />
      <img
        className="search"
        src={Searchicon}
        onClick={handleCompanySearch}
        alt="Search"
      />

      {showAutoComplete && autoCompleteValue.length > 0 && (
        <AutoCompleteContainer ref={autoCompleteContainerRef}>
          {autoCompleteValue.map((value, index) => (
            <AutoCompleteItem
              key={index}
              onClick={() => selectAutoCompleteValue(value.name)}
              style={
                index === activeIndex ? { backgroundColor: '#f2f2f2' } : {}
              }
            >
              {value.companyName}
            </AutoCompleteItem>
          ))}
        </AutoCompleteContainer>
      )}
    </>
  );
}

export default SearchInput;
