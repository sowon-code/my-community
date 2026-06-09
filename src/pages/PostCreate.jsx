import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './PostCreate.module.css'

const CATEGORIES = ['센터소개', '입양하기', '방문안내', '공지사항']
const RANDOM_IMAGE_API = 'https://dog.ceo/api/breeds/image/random'

export default function PostCreate() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('공지사항')
  const [imageUrl, setImageUrl] = useState('')
  const [hashtag, setHashtag] = useState('')
  const [hashtags, setHashtags] = useState([])
  const [loading, setLoading] = useState(false)
  const [imgLoading, setImgLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) navigate('/')
      setUser(user)
    })
  }, [])

  const handleRandomImage = async () => {
    setImgLoading(true)
    try {
      const res = await fetch(RANDOM_IMAGE_API)
      const data = await res.json()
      setImageUrl(data.message)
    } catch {
      setImageUrl('')
    }
    setImgLoading(false)
  }

  const addHashtag = (e) => {
    if (e.key === 'Enter' && hashtag.trim()) {
      e.preventDefault()
      const tag = hashtag.trim().replace(/^#/, '')
      if (!hashtags.includes(tag)) setHashtags([...hashtags, tag])
      setHashtag('')
    }
  }

  const removeHashtag = (tag) => setHashtags(hashtags.filter((t) => t !== tag))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !content) return
    setLoading(true)
    const { error } = await supabase.from('posts').insert({
      title,
      content,
      category,
      image_url: imageUrl || null,
      hashtags,
      author_id: user.id,
    })
    setLoading(false)
    if (!error) navigate('/posts')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/posts" className={styles.backBtn}>← 목록으로</Link>
          <span className={styles.headerTitle}>🐾 게시물 작성</span>
        </div>
      </header>

      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={`card ${styles.form}`}>
          {/* 카테고리 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>카테고리</label>
            <div className={styles.catRow}>
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  className={`${styles.catBtn} ${category === cat ? styles.catActive : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>제목</label>
            <input
              type="text"
              className="input-field"
              placeholder="제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* 내용 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>내용</label>
            <textarea
              className={`input-field ${styles.textarea}`}
              placeholder="내용을 입력해주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              required
            />
          </div>

          {/* 이미지 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>이미지</label>
            <button
              type="button"
              className={styles.imgBtn}
              onClick={handleRandomImage}
              disabled={imgLoading}
            >
              {imgLoading ? '이미지 가져오는 중...' : '🐕 랜덤 강아지 사진 추가'}
            </button>
            {imageUrl && (
              <div className={styles.imgPreview}>
                <img src={imageUrl} alt="랜덤 강아지" />
                <button type="button" className={styles.removeImg} onClick={() => setImageUrl('')}>✕</button>
              </div>
            )}
          </div>

          {/* 해시태그 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>해시태그 <span className={styles.hint}>(입력 후 Enter)</span></label>
            <input
              type="text"
              className="input-field"
              placeholder="#해시태그 입력 후 Enter"
              value={hashtag}
              onChange={(e) => setHashtag(e.target.value)}
              onKeyDown={addHashtag}
            />
            {hashtags.length > 0 && (
              <div className={styles.tags}>
                {hashtags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    #{tag}
                    <button type="button" onClick={() => removeHashtag(tag)}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={loading || !title || !content}>
            {loading ? '등록 중...' : '게시물 등록 🐾'}
          </button>
        </form>
      </main>
    </div>
  )
}
