SEO nästan klar, vi måste kontrollera att allt är inkluderat och fungerar som förväntat. För närvarande får vi fel i author, tag och category. Vi måste se över den logiken igen.

ta bort beroenden som inte längre används

fixa annons-popup på surfplatta, bilden är trasig. (Klart)
i populära inlägg visas ibland två annonser bredvid varandra. (Klart)
Dölj tickern på mobil, den tar för mycket plats, och sökfältet? (Klart, och fixad kategorivisning på stora brytpunkter)
lägg till popup, contain är bättre än cover, åtminstone på mobil? Och utseendet är riktigt dåligt på surfplatta och mobil. (Klart)
nyhetsbrevsmodalen är också trasig på mobil. (Klart)

I sökfunktionen tittar vi på inmatade bokstäver och kontrollerar om de finns från höger till vänster; vi matchar bokstav för bokstav vilket är fel. Vi måste kontrollera hela titeln om bokstaven finns. Om vi skriver en bokstav som inte finns i sökfältet och sedan trycker enter, visas alla inlägg som innehåller den bokstaven. ÅTGÄRDA.
grundläggande dålig UI

vi skickar taggtiteln och inte sluggen
när vi navigerar till kategori ser vi saknad slug.
http://localhost:3000/tag
http://localhost:3000/category

här ser vi ingenting?
http://localhost:3000/author

1. Rate limiter (Klart)
2. Organisera GraphQL-frågor (Klart)
3. Lägg till popup
4. Kontrollera koden, det finns många ställen som använder <a>, <button> etc. Se till att använda next och shadcn PopupModal (jag laddade upp en kod där, testa den, och kommenterade ut den gamla) exempelvis.
5. Styla hela sidan (centralisera stilen för alla sidor, just nu gör varje sida sin egen grej)
6. SEO. meta-taggar, Open Graph och dubbelkolla allt.
7. Se till att alla bilder är optimerade.
8. Bestäm vilken postdata som ska visas för användaren.
9. Lägg till robots/sitemap
10. kontrollera säkerhet

INFO
Server- och klientkomponenter kan användas tillsammans men för seo, prestanda och säkerhet rekommenderas att använda klientkomponenter inom en serverkomponent. När du använder "use client" blir alla importer/barn också klienter, så var försiktig med importerna och placera "use server" där det behövs. Det finns något som kallas fetch-memorisering som i princip cachelagrar begäran du har skickat så länge parametrar, fråga, url och allt matchar och det gäller endast för GET-begäran; om svaret ändras kommer resultatet vara den första versionen tills revalidate. Jag tror att användning av fetch-memorisering är bättre för prestanda, vi måste kolla upp det.

*** ATT GÖRA ***

Kolla senare:

SKAPA EN DAGENS NYHETER MARKNAD SOM DI.SE

Start/Huvudsida (förstasida eller inläggsindex)
Enskild sida
Enskilt inlägg
Kategoriarkiv
Taggarkiv
Författararkiv
404 Hittades inte
Datumarkiv (år/månad/dag): /2025/, /2025/08/, etc.
Pagineringslägen för alla arkiv (och inläggsindex): /page/2/, /category/foo/page/3/
De är separata URL:er, så de behöver egen <title>, canonical till sig själv och robots speglade från Rank Math.
Sökresultat: /search?q=… (eller / ?s=).
Servera meta (titel som "Sökresultat för …") och vanligtvis noindex, follow.

//Rendera SEO-data för varje kategori i WP,
