import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div>
      <h2>Hittades inte</h2>
      <p>Kunde inte hitta efterfrågad resurs</p>
      <Link href="/">Gå tillbaka till startsidan</Link>
    </div>
  )
}