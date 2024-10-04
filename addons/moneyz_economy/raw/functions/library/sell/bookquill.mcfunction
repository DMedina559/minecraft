tell @initiator[hasitem={item=writable_book,quantity=..0}] §cYou can't sell a Book and Quill!

tell @initiator[hasitem={item=writable_book,quantity=1..}] §aYou can sell a Book and Quill!

scoreboard players add @initiator[hasitem={item=writable_book,quantity=1..}] Moneyz 25

tell @initiator[hasitem={item=writable_book,quantity=1..}] §aSold a Book and Quill!

clear @initiator[hasitem={item=writable_book,quantity=1..}] writable_book 0 1