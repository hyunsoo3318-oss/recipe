import { useState, useEffect } from 'react';
import './styles/App.css';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const recipesPerPage = 12;

  useEffect(() => {
    if (isSearching && searchQuery.trim()) {
      searchRecipes(searchQuery, currentPage);
    } else if (!isSearching) {
      fetchRecipes(currentPage);
    }
  }, [currentPage, isSearching]);

  const fetchRecipes = async (page) => {
    try {
      setLoading(true);
      const skip = (page - 1) * recipesPerPage;
      const response = await fetch(`https://dummyjson.com/recipes?limit=${recipesPerPage}&skip=${skip}`);
      if (!response.ok) {
        throw new Error('레시피를 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setRecipes(data.recipes);
      setTotalRecipes(data.total);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchRecipes = async (query, page) => {
    try {
      setLoading(true);
      const skip = (page - 1) * recipesPerPage;
      const response = await fetch(`https://dummyjson.com/recipes/search?q=${encodeURIComponent(query)}&limit=${recipesPerPage}&skip=${skip}`);
      if (!response.ok) {
        throw new Error('검색에 실패했습니다.');
      }
      const data = await response.json();
      setRecipes(data.recipes);
      setTotalRecipes(data.total);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      setCurrentPage(1);
      searchRecipes(searchQuery, 1);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    if (currentPage === 1) {
      fetchRecipes(1);
    } else {
      setCurrentPage(1);
    }
  };

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeModal = () => {
    setSelectedRecipe(null);
  };

  const totalPages = Math.ceil(totalRecipes / recipesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>레시피를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>❌ {error}</p>
        <button onClick={() => fetchRecipes(currentPage)}>다시 시도</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🍳 레시피 모음</h1>
        <p className="subtitle">맛있는 요리 레시피를 찾아보세요</p>
        
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="레시피 이름으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              🔍 검색
            </button>
            {isSearching && (
              <button type="button" className="clear-button" onClick={handleClearSearch}>
                ✕ 초기화
              </button>
            )}
          </div>
        </form>

        <p className="recipe-count">
          {isSearching ? `'${searchQuery}' 검색 결과: ${totalRecipes}개` : `총 ${totalRecipes}개의 레시피`}
        </p>
      </header>

      <main className="main-content">
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <div 
              key={recipe.id} 
              className="recipe-card"
              onClick={() => handleRecipeClick(recipe)}
            >
              <div className="recipe-image">
                <img src={recipe.image} alt={recipe.name} />
                <div className="recipe-difficulty">{recipe.difficulty}</div>
              </div>
              <div className="recipe-info">
                <h3>{recipe.name}</h3>
                <div className="recipe-meta">
                  <span>⏱️ {recipe.prepTimeMinutes + recipe.cookTimeMinutes}분</span>
                  <span>👥 {recipe.servings}인분</span>
                  <span>⭐ {recipe.rating}</span>
                </div>
                <div className="recipe-tags">
                  {recipe.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalRecipes > 0 && (
          <div className="pagination">
            <button 
              className="pagination-button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← 이전
            </button>

            <div className="pagination-numbers">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                ) : (
                  <button
                    key={page}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            <button 
              className="pagination-button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              다음 →
            </button>
          </div>
        )}
      </main>

      {selectedRecipe && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>✕</button>
            
            <div className="modal-header">
              <img src={selectedRecipe.image} alt={selectedRecipe.name} />
              <div className="modal-title-section">
                <h2>{selectedRecipe.name}</h2>
                <div className="modal-meta">
                  <span>⏱️ 준비: {selectedRecipe.prepTimeMinutes}분</span>
                  <span>🔥 조리: {selectedRecipe.cookTimeMinutes}분</span>
                  <span>👥 {selectedRecipe.servings}인분</span>
                  <span>⭐ {selectedRecipe.rating}</span>
                  <span className="difficulty-badge">{selectedRecipe.difficulty}</span>
                </div>
                <div className="modal-tags">
                  {selectedRecipe.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-body">
              <section className="ingredients-section">
                <h3>📝 재료</h3>
                <ul>
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </section>

              <section className="instructions-section">
                <h3>👨‍🍳 조리 방법</h3>
                <ol>
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </section>

              <section className="additional-info-section">
                <h3>ℹ️ 추가 정보</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">칼로리 (1인분)</span>
                    <span className="info-value">{selectedRecipe.caloriesPerServing} kcal</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">요리 종류</span>
                    <span className="info-value">{selectedRecipe.cuisine}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">난이도</span>
                    <span className="info-value">{selectedRecipe.difficulty}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">리뷰 수</span>
                    <span className="info-value">{selectedRecipe.reviewCount}개</span>
                  </div>
                </div>
              </section>

              {selectedRecipe.mealType && selectedRecipe.mealType.length > 0 && (
                <section className="meal-type-section">
                  <h3>🍽️ 식사 유형</h3>
                  <div className="meal-types">
                    {selectedRecipe.mealType.map((type, index) => (
                      <span key={index} className="meal-type-tag">{type}</span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;