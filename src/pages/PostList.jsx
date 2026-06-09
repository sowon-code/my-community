import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './PostList.module.css'

const CATEGORIES = ['전체', '센터소개', '입양하기', '방문안내', '공지사항']

const CATEGORY_EMOJI = {
  센터소개: '🏠',
  입양하기: '🐕',
  방문안내: '📍',
  공지사항: '📢',
}

export default function PostList() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [activeCategory, setActiveCategory] = useState('전체')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { navigate('/'); return }
      const user = session.user
      setUser(user)
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(prof)
      await fetchPosts()
    }
    init()
  }, [])

  const fetchPosts = async (category = '전체') => {
    setLoading(true)
    let query = supabase
      .from('posts')
      .select(`
        id, title, content, category, created_at, image_url,
        author:profiles(nickname),
        comments:comments(count),
        likes:likes(count)
      `)
      .order('created_at', { ascending: false })

    if (category !== '전체') query = query.eq('category', category)

    const { data } = await query
    setPosts(data || [])
    setLoading(false)
  }

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    fetchPosts(cat)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/posts" className={styles.logo}>
            <span className={styles.logoIcon}>🐶</span>
            <span className={styles.logoText}>Love Dog Community</span>
          </Link>
          <div className={styles.headerRight}>
            {profile && (
              <span className={styles.welcome}>
                <strong>{profile.nickname}</strong>님 환영해요! 🐾
              </span>
            )}
            <button className="btn-secondary" onClick={handleLogout}>로그아웃</button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* 배너 */}
        <div className={styles.banner}>
          <p className={styles.bannerText}>🐕 유기견에게 사랑 가득한 새 가족을 찾아주세요 💕</p>
        </div>

        {/* 카테고리 필터 */}
        <div className={styles.categories}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.catBtn} ${activeCategory === cat ? styles.catActive : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat !== '전체' ? CATEGORY_EMOJI[cat] + ' ' : '🐾 '}{cat}
            </button>
          ))}
        </div>

        {/* 게시물 작성 버튼 */}
        <div className={styles.toolbar}>
          <span className={styles.postCount}>게시물 {posts.length}개</span>
          <Link to="/posts/create" className={`btn-primary ${styles.createBtn}`}>
            + 게시물 쓰기
          </Link>
        </div>

        {/* 게시물 목록 */}
        {loading ? (
          <div className={styles.loading}>불러오는 중... 🐾</div>
        ) : posts.length === 0 ? (
          <div className={styles.empty}>
            <span>🐶</span>
            <p>아직 게시물이 없어요. 첫 번째 글을 작성해보세요!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {posts.map((post) => (
              <Link to={`/posts/${post.id}`} key={post.id} className={styles.postCard}>
                {/* 썸네일 */}
                <div className={styles.thumbnail}>
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.title} className={styles.thumbImg} />
                  ) : (
                    <div className={styles.thumbPlaceholder}>🐶</div>
                  )}
                  <span className={styles.postCat}>
                    {CATEGORY_EMOJI[post.category]} {post.category}
                  </span>
                </div>
                {/* 카드 내용 */}
                <div className={styles.cardBody}>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  <p className={styles.postContent}>
                    {post.content.slice(0, 60)}{post.content.length > 60 ? '...' : ''}
                  </p>
                  <div className={styles.postFooter}>
                    <span className={styles.postAuthor}>🐾 {post.author?.nickname}</span>
                    <div className={styles.postStats}>
                      <span>💬 {post.comments?.[0]?.count ?? 0}</span>
                      <span>❤️ {post.likes?.[0]?.count ?? 0}</span>
                    </div>
                  </div>
                  <span className={styles.postDate}>{formatDate(post.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
