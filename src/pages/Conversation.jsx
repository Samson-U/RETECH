/* eslint-disable react-hooks/set-state-in-effect */
import { ArrowLeft, ArrowRight, Check, Clock, MessageCircle, Send, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ImageWithFallback from '../components/ImageWithFallback'
import { formatPrice } from '../data/products'
import { useAuth } from '../context/useAuth'
import { negotiationApi } from '../services/api'

function Conversation() {
  const { conversationId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState(null)
  const [message, setMessage] = useState('')
  const [amount, setAmount] = useState('')
  const [counterAmounts, setCounterAmounts] = useState({})
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [actionId, setActionId] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const historyRef = useRef(null)
  const userId = user?.id || user?._id

  const load = useCallback(async () => {
    try {
      const next = await negotiationApi.get(conversationId)
      setData(next)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }, [conversationId])

  useEffect(() => {
    if (!user) return undefined
    load()
    const timer = window.setInterval(load, 5000)
    return () => window.clearInterval(timer)
  }, [load, user])

  useEffect(() => {
    if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight
  }, [data?.messages?.length])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const sendMessage = async (event) => {
    event.preventDefault()
    if (!message.trim()) return
    setSending(true)
    try {
      await negotiationApi.message(conversationId, message)
      setMessage('')
      await load()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSending(false)
    }
  }

  const handleMessageKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  const submitOffer = async (event) => {
    event.preventDefault()
    setActionId('new-offer')
    try {
      await negotiationApi.offer(conversationId, Number(amount))
      setAmount('')
      await load()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setActionId('')
    }
  }

  const offerAction = async (action, offerId, value) => {
    setActionId(offerId)
    try {
      if (action === 'counter') await negotiationApi.counter(offerId, Number(value))
      if (action === 'accept') await negotiationApi.accept(offerId)
      if (action === 'reject') await negotiationApi.reject(offerId)
      await load()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setActionId('')
    }
  }

  const isSeller = data && String(data.conversation.seller?._id || data.conversation.seller) === String(userId)
  const pendingOffer = useMemo(() => data?.offers?.find((offer) => offer.state === 'PENDING'), [data])
  const product = data?.conversation?.product
  const agreement = data?.agreement
  const pendingCreatorId = pendingOffer?.offeredBy?._id || pendingOffer?.offeredBy
  const recipientLabel = pendingOffer ? (String(pendingCreatorId) === String(userId) ? 'Waiting for the other participant' : 'Your response is needed') : 'No active offer'
  const canRespond = pendingOffer && String(pendingCreatorId) !== String(userId)
  const image = product?.image || product?.imageUrl
  const remaining = agreement?.status === 'ACTIVE' ? Math.max(0, new Date(agreement.expiresAt).getTime() - now) : 0
  const remainingLabel = `${Math.floor(remaining / 3_600_000)}h ${Math.floor((remaining % 3_600_000) / 60_000)}m ${Math.floor((remaining % 60_000) / 1000)}s`

  if (authLoading) return <div className="page-shell feedback-state"><p className="eyebrow">Private deal / Loading</p><h3>Opening the<br /><em>conversation.</em></h3></div>
  if (!user) return <div className="page-shell simple-page"><p className="eyebrow">Private deal / Account required</p><h1>Log in to<br /><em>make a deal.</em></h1><Link className="button-link" to="/auth">Continue to account <ArrowRight size={16} /></Link></div>
  if (!data && !error) return <div className="page-shell feedback-state"><p className="eyebrow">Private deal / Loading</p><h3>Finding the<br /><em>conversation.</em></h3></div>
  if (error && !data) return <div className="page-shell feedback-state"><p className="eyebrow">Private deal / Unavailable</p><h3>This conversation<br /><em>is private.</em></h3><p>{error}</p><Link className="button-link" to="/shop">Back to collection <ArrowLeft size={16} /></Link></div>

  return <div className="page-shell conversation-page">
    <Link className="back-link" to={`/product/${product.id || product._id}`}><ArrowLeft size={16} /> Back to product</Link>
    <header className="conversation-header">
      <ImageWithFallback src={image} alt={product.title || product.name} />
      <div className="conversation-summary"><p className="eyebrow">Private negotiation / {data.conversation.status}</p><h1>{product.title || product.name}</h1><p>{isSeller ? `Buyer: ${data.conversation.buyer.name}` : `Seller: ${data.conversation.seller.name}`} <span>·</span> Listed at {formatPrice(product.price)}</p></div>
    </header>
    {agreement && <div className={`agreement-panel ${agreement.status !== 'ACTIVE' ? 'agreement-inactive' : ''}`}><div><p className="eyebrow">Locked price agreement</p><strong>{formatPrice(agreement.agreedPrice)}</strong><span>Original listing {formatPrice(product.price)} · {agreement.status === 'ACTIVE' ? `${remainingLabel} remaining · expires ${new Date(agreement.expiresAt).toLocaleString()}` : `Agreement ${agreement.status.toLowerCase()}`}</span></div>{agreement.status === 'ACTIVE' && !isSeller && <Link className="button-link" to={`/checkout?agreementId=${agreement._id}`}>Checkout at agreed price <ArrowRight size={16} /></Link>}</div>}
    <div className="conversation-layout">
      <section className="chat-panel">
        <div className="chat-panel-heading"><div><p className="eyebrow">Messages</p><strong>Private thread</strong></div><MessageCircle size={18} /></div>
        <div className="chat-history" ref={historyRef}>{data.messages.map((item) => <article className={`chat-message ${String(item.sender?._id || item.sender) === String(userId) ? 'mine' : ''}`} key={item._id}><span>{item.sender?.name || 'Participant'}</span><p>{item.body}</p><time>{new Date(item.createdAt).toLocaleString()}</time></article>)}{!data.messages.length && <p className="empty-state">No messages yet. Start the private conversation.</p>}</div>
        <form className="chat-composer" onSubmit={sendMessage}><textarea value={message} maxLength="1000" rows="2" onKeyDown={handleMessageKeyDown} onChange={(event) => setMessage(event.target.value)} placeholder="Write a private message... Enter to send, Shift+Enter for a new line." aria-label="Message" /><button aria-label="Send message" disabled={sending || !message.trim()}>{sending ? 'Sending' : <Send size={17} />}</button></form>
      </section>
      <aside className="offers-panel">
        <div className="offers-heading"><div><p className="eyebrow">Negotiation</p><h2>Make a<br /><em>deal.</em></h2></div><p className="listed-price">Listed<br /><strong>{formatPrice(product.price)}</strong></p></div>
        <div className="offer-status"><span>Current status</span><strong>{pendingOffer ? pendingOffer.state : agreement ? agreement.status : 'OPEN'}</strong><small>{recipientLabel}</small></div>
        {pendingOffer && <article className="offer-card offer-pending active-offer"><div><span>ACTIVE OFFER</span><strong>{formatPrice(pendingOffer.amount)}</strong></div><p>{pendingOffer.offeredBy?.name || 'Participant'} · {new Date(pendingOffer.createdAt).toLocaleString()}</p>{canRespond && <div className="offer-actions"><button disabled={actionId === pendingOffer._id} onClick={() => offerAction('accept', pendingOffer._id)}><Check size={14} /> Accept</button><button disabled={actionId === pendingOffer._id} onClick={() => offerAction('reject', pendingOffer._id)}><X size={14} /> Decline</button><div className="counter-control"><input type="number" min="1" value={counterAmounts[pendingOffer._id] || ''} onChange={(event) => setCounterAmounts({ ...counterAmounts, [pendingOffer._id]: event.target.value })} placeholder="New counter amount" /><button disabled={actionId === pendingOffer._id || !counterAmounts[pendingOffer._id]} onClick={() => offerAction('counter', pendingOffer._id, counterAmounts[pendingOffer._id])}>Counter</button></div></div>}</article>}
        <div className="offer-history"><p className="eyebrow">Offer history</p>{data.offers.length ? data.offers.map((offer) => <div className={`offer-history-row offer-${offer.state.toLowerCase()}`} key={offer._id}><span>{offer.state}</span><strong>{formatPrice(offer.amount)}</strong><small>{offer.offeredBy?.name || 'Participant'} · {new Date(offer.createdAt).toLocaleDateString()}</small></div>) : <p className="empty-copy">No offers have been submitted.</p>}</div>
        {!isSeller && !pendingOffer && !agreement && product.status === 'available' && <form className="offer-form" onSubmit={submitOffer}><label>Your offer<input type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={String(product.price)} required /></label><button className="button-link" type="submit" disabled={actionId === 'new-offer'}>{actionId === 'new-offer' ? 'Submitting...' : 'Submit offer'} <ArrowRight size={16} /></button></form>}
        {pendingOffer && <p className="offer-note"><Clock size={14} /> {recipientLabel}</p>}
      </aside>
    </div>
    {error && <p className="form-error">{error}</p>}
  </div>
}

export default Conversation
