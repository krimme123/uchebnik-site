import React, { useState, useEffect } from 'react';
import './Portfolio.css';

const Portfolio = () => {
  const [works, setWorks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('Все предметы');
  const [selectedClass, setSelectedClass] = useState('Все классы');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔧 ЗАМЕНИТЕ ЭТОТ ID НА ВАШ РЕАЛЬНЫЙ ID ТАБЛИЦЫ
  const SHEET_ID = '1MJgYwSVGXQ8HquceWa4yxxTxrPytiDmRm5gaZ0ssGCc';

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`
        );
        
        if (!response.ok) {
          throw new Error('Ошибка загрузки данных');
        }
        
        const text = await response.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        
        const worksData = json.table.rows.map((row, index) => {
          const cells = row.c;
          return {
            id: index + 1,
            subject: cells[0]?.v || 'Без предмета',
            class: cells[1]?.v || 'Без класса',
            title: cells[2]?.v || 'Без названия',
            description: cells[3]?.v || '',
            image: cells[4]?.v || '',
            file_url: cells[5]?.v || '',
            type: cells[6]?.v || '',
            theme: cells[7]?.v || ''
          };
        });
        
        setWorks(worksData);
        
        // Получаем уникальные предметы и классы
        const uniqueSubjects = [...new Set(worksData.map(work => work.subject))];
        const uniqueClasses = [...new Set(worksData.map(work => work.class))];
        
        setSubjects(['Все предметы', ...uniqueSubjects]);
        setClasses(['Все классы', ...uniqueClasses]);
        setError('');
      } catch (err) {
        setError('Не удалось загрузить работы. Проверьте ID таблицы и настройки доступа.');
        console.error('Ошибка:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, []);

  // Фильтрация работ
  const filteredWorks = works.filter(work => {
    const subjectMatch = selectedSubject === 'Все предметы' || work.subject === selectedSubject;
    const classMatch = selectedClass === 'Все классы' || work.class === selectedClass;
    return subjectMatch && classMatch;
  });

  // Группировка по предметам
  const groupedWorks = filteredWorks.reduce((acc, work) => {
    if (!acc[work.subject]) {
      acc[work.subject] = [];
    }
    acc[work.subject].push(work);
    return acc;
  }, {});

  // Иконки для типов работ
  const getTypeIcon = (type) => {
    const icons = {
      'проект': '📊',
      'контрольная': '📝',
      'исследование': '🔬',
      'практическая': '🔧',
      'лабораторная': '⚗️',
      'реферат': '📄'
    };
    return icons[type] || '📁';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Загружаем учебные работы...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <small>Проверьте ID таблицы в коде Portfolio.jsx</small>
      </div>
    );
  }

  return (
    <div className="portfolio">
      <h1>📚 Учебные работы</h1>
      
      {/* Фильтры */}
      <div className="filters">
        <select 
          value={selectedSubject} 
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
        
        <select 
          value={selectedClass} 
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          {classes.map(className => (
            <option key={className} value={className}>{className}</option>
          ))}
        </select>
      </div>

      {/* Отображение работ */}
      <div className="works-container">
        {Object.keys(groupedWorks).length === 0 ? (
          <p className="no-works">Нет работ для выбранных фильтров</p>
        ) : (
          Object.entries(groupedWorks).map(([subject, subjectWorks]) => (
            <div key={subject} className="subject-section">
              <h2 className="subject-title">{subject}</h2>
              <div className="works-grid">
                {subjectWorks.map(work => (
                  <div key={work.id} className="work-card">
                    <div className="work-content">
                      <div className="work-meta">
                        <span className="class-badge">{work.class} класс</span>
                        <span className="type-badge">
                          {getTypeIcon(work.type)} {work.type}
                        </span>
                      </div>
                      
                      <h3>{work.title}</h3>
                      <p className="description">{work.description}</p>
                      
                      {work.theme && (
                        <div className="theme">
                          <strong>Тема:</strong> {work.theme}
                        </div>
                      )}
                      
                      <div className="work-actions">
                        {work.file_url && (
                          <a 
                            href={work.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="download-btn"
                          >
                            📥 Скачать работу
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Portfolio;
