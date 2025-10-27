-- Create the Books table
CREATE TABLE Books (
    id INT PRIMARY KEY IDENTITY(1,1), --  ID increment! 
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    published DATE NOT NULL,
    pages INT NOT NULL
);

-- book records -- the db will automatically assign IDs 1++
INSERT INTO Books (title, author, description, published, pages) VALUES
-- Initial 6 Books
('The River and the Source', 'Margaret Ogola', 'A Kenyan classic exploring three generations of women.', '1994-01-01', 300),
('Petals of Blood', 'Ngũgĩ wa Thiong''o', 'A political novel on post-colonial betrayal in Kenya.', '1977-01-01', 345),
('Dust', 'Yvonne Owuor', 'A lyrical novel about identity, history, and violence.', '2014-01-01', 395),
('A Grain of Wheat', 'Ngũgĩ wa Thiong''o', 'A powerful novel set during the Mau Mau rebellion.', '1967-01-01', 280),
('The House of Stone', 'Novuyo Rosa Tshuma', 'A tale of family, history, and memory in post-colonial Africa.', '2019-01-01', 400),
('Unbowed', 'Wangari Maathai', 'Memoir of the Nobel Peace Prize winner and founder of the Green Belt Movement.', '2006-01-01', 336),
('Half of a Yellow Sun', 'Chimamanda Ngozi Adichie', 'Set during the Nigerian Civil War, exploring love and loss.', '2006-08-01', 433),
('Things Fall Apart', 'Chinua Achebe', 'The classic story of pre-colonial Igbo life and the arrival of Europeans.', '1958-06-01', 209),
('The Joys of Motherhood', 'Buchi Emecheta', 'A critique of traditional roles and the harsh realities of a changing Nigeria.', '1979-01-01', 224),
('Wizard of the Crow', 'Ngũgĩ wa Thiong''o', 'A satirical novel about a totalitarian ruler in the fictional Free Republic of Aburiria.', '2006-01-01', 768);
GO


-- 1. If the Books table exists, drop it
--DROP TABLE Books;
--GO

