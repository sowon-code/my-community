import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './PostDetail.module.css'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [userId, setUserId] = useState(null)
  const [post, setPost] = useState(null)
  const [isOwner, setIsOwner] = useState(false)
  const [comments, setComments] = useState([])
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/'); return }
      setUserId(user.id)
      await fetchPost(user.id)
      await fetchComments()
    }
    init()
  }, [id])

  const fetchPost = async (uid) => {
    const { data } = await supabase
      .from('posts')
      .select(`*, author:profiles(nickname)`)
      .eq('id', id)
      .single()
    if (!data) { navigate('/posts'); return }
    setPost(data)
    setIsOwner(data.author_id === uid)

    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', id)
    setLikeCount(count || 0)

    const { data: myLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', uid)
      .maybeSingle()
    setLiked(!!myLike)
    setLoading(false)
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select(`*, author:profiles(nickname)`)
      .eq('post_id', id)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }

  const handleLike = async () => {
    if (!userId) return
    if (liked) {
      await supabase.from('likes').delete().eq('post_id', id).eq('user_id', userId)
      setLiked(false)
      setLikeCount((c) => c - 1)
    } else {
      await supabase.from('likes').insert({ post_id: id, user_id: userId })
      setLiked(true)
      setLikeCount((c) => c + 1)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    await supabase.from('comments').insert({
      content: commentText.trim(),
      post_id: id,
      author_id: userId,
    })
    setCommentText('')
    await fetchComments()
    setSubmitting(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await supabase.from('posts').delete().eq('id', id)
    navigate('/posts')
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  if (loading) return <div className={styles.loading}>불러오는 중... 🐾</div>
  if (!post) return null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/posts" className={styles.backBtn}>← 목록으로</Link>
          <span className={styles.logoText}>🐶 Love Dog Community</span>
          {isOwner && (
            <div className={styles.authorActions}>
              {confirmDelete ? (
                <>
                  <span className={styles.confirmText}>정말 삭제할까요?</span>
                  <button className={styles.deleteConfirmBtn} onClick={handleDelete} disabled={deleting}>
                    {deleting ? '삭제 중...' : '삭제'}
                  </button>
                  <button className={styles.cancelBtn} onClick={() => setConfirmDelete(false)}>취소</button>
                </>
              ) : (
                <>
                  <Link to={`/posts/${id}/edit`} className={styles.editBtn}>수정하기</Link>
                  <button className={styles.deleteBtn} onClick={() => setConfirmDelete(true)}>삭제하기</button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <article className={`card ${styles.article}`}>
          <div className={styles.postCat}>{post.category}</div>
          <h1 className={styles.postTitle}>{post.title}</h1>
          <div className={styles.postMeta}>
            <span>🐾 {post.author?.nickname}</span>
            <span>{formatDate(post.created_at)}</span>
          </div>
          <hr className={styles.divider} />
          {post.image_url && (
            <img src={post.image_url} alt="게시물 이미지" className={styles.postImage} />
          )}
          <p className={styles.postContent}>{post.content}</p>
          {post.hashtags?.length > 0 && (
            <div className={styles.hashtags}>
              {post.hashtags.map((tag) => (
                <span key={tag} className={styles.tag}>#{tag}</span>
              ))}
            </div>
          )}

          <div className={styles.likeRow}>
            <button
              className={`${styles.likeBtn} ${liked ? styles.liked : ''}`}
              onClick={handleLike}
            >
              {liked ? '❤️' : '🤍'} 좋아요 {likeCount}
            </button>
          </div>
        </article>

        <section className={`card ${styles.commentSection}`}>
          <h3 className={styles.commentTitle}>댓글 {comments.length}개</h3>

          <form onSubmit={handleComment} className={styles.commentForm}>
            <textarea
              className={`input-field ${styles.commentInput}`}
              placeholder="댓글을 입력해주세요 🐾"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
            />
            <button type="submit" className="btn-primary" disabled={submitting || !commentText.trim()}>
              {submitting ? '등록 중...' : '댓글 등록'}
            </button>
          </form>

          <div className={styles.commentList}>
            {comments.length === 0 ? (
              <p className={styles.noComment}>첫 번째 댓글을 남겨보세요! 🐕</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className={styles.commentItem}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAuthor}>🐾 {c.author?.nickname}</span>
                    <span className={styles.commentDate}>{formatDate(c.created_at)}</span>
                  </div>
                  <p className={styles.commentContent}>{c.content}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
