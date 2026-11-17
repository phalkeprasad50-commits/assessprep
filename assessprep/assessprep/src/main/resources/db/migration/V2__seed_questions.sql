INSERT INTO questions (topic, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
-- JAVA
('JAVA','EASY','Which collection does not allow duplicate elements?','List','ArrayList','Set','LinkedList','C','A Set rejects duplicates; Lists keep them.'),
('JAVA','MEDIUM','What is the output of System.out.println(10 + 20 + "Java" + 10 + 20);','30Java1020','1020Java1020','30Java30','Compilation error','A','Evaluation is left to right: 10+20 = 30, then string concatenation takes over, giving 30Java1020.'),
('JAVA','EASY','Which keyword prevents a class from being subclassed?','abstract','static','synchronized','final','D','A final class cannot be extended.'),
('JAVA','EASY','How many null keys can a HashMap hold?','0','1','2','Unlimited','B','HashMap allows exactly one null key (keys are unique) and many null values.'),
('JAVA','EASY','Which of these is a checked exception?','NullPointerException','ArithmeticException','IOException','ArrayIndexOutOfBoundsException','C','IOException is checked, so it must be caught or declared. The others are runtime exceptions.'),
('JAVA','MEDIUM','What does == compare for two objects created with new String("abc")?','References','Content','Length','Hash codes','A','== compares references. Use equals() to compare content.'),
-- SQL
('SQL','EASY','Which clause filters groups after aggregation is applied?','WHERE','HAVING','GROUP BY','ORDER BY','B','WHERE filters rows before grouping; HAVING filters groups after aggregation.'),
('SQL','EASY','Which join returns all rows from the left table plus matching rows from the right table?','INNER JOIN','CROSS JOIN','SELF JOIN','LEFT JOIN','D','LEFT JOIN keeps every left row, with NULLs where the right side has no match.'),
('SQL','MEDIUM','How does COUNT(column) treat NULL values in that column?','Counts them too','Throws an error','Ignores them','Counts only distinct values','C','COUNT(column) skips NULLs; COUNT(*) counts every row.'),
('SQL','EASY','Which command removes a table definition together with all its data?','DROP TABLE','DELETE','TRUNCATE','REMOVE TABLE','A','DROP TABLE deletes the structure and data. TRUNCATE only empties it.'),
('SQL','MEDIUM','Which window function assigns ranks with no gaps after ties?','RANK','DENSE_RANK','ROW_NUMBER','NTILE','B','DENSE_RANK gives 1,1,2 for ties; RANK gives 1,1,3.'),
('SQL','MEDIUM','Which query returns the second highest salary from table emp?','SELECT MIN(salary) FROM emp','SELECT salary FROM emp GROUP BY name','SELECT COUNT(salary) FROM emp','SELECT MAX(salary) FROM emp WHERE salary < (SELECT MAX(salary) FROM emp)','D','It takes the maximum of all salaries below the overall maximum.'),
-- DSA
('DSA','EASY','What is the time complexity of binary search on a sorted array?','O(n)','O(n log n)','O(log n)','O(1)','C','The search space is halved on every step.'),
('DSA','EASY','Which data structure is used for breadth-first search?','Queue','Stack','Heap','Trie','A','BFS visits nodes level by level, which needs a FIFO queue.'),
('DSA','MEDIUM','What is the worst-case time complexity of quicksort?','O(n log n)','O(n^2)','O(n)','O(log n)','B','Bad pivots, such as an already sorted array with a first-element pivot, give O(n^2).'),
('DSA','EASY','Which data structure follows LIFO order?','Queue','Heap','Graph','Stack','D','The last element pushed onto a stack is the first one popped.'),
('DSA','EASY','What is the average time complexity of a lookup in a hash table?','O(n)','O(log n)','O(1)','O(n^2)','C','With a good hash function and load factor, lookups take constant time on average.'),
('DSA','EASY','What does an inorder traversal of a binary search tree produce?','Elements in sorted ascending order','Level order elements','Elements in reverse order','Random order','A','Left, root, right visits BST keys in ascending order.'),
-- DBMS
('DBMS','EASY','In ACID, what does the letter I stand for?','Integrity','Isolation','Indexing','Inheritance','B','Isolation means concurrent transactions do not interfere with each other.'),
('DBMS','MEDIUM','Which normal form removes partial dependencies?','1NF','3NF','2NF','BCNF','C','2NF requires that no non-key attribute depends on only part of a composite key.'),
('DBMS','EASY','What does a foreign key enforce?','Faster queries','Encryption of data','Uniqueness in the table','Referential integrity between tables','D','A foreign key guarantees the referenced row exists in the parent table.'),
('DBMS','EASY','Which of these is a DDL command?','ALTER','SELECT','INSERT','UPDATE','A','DDL defines structure (CREATE, ALTER, DROP). The others are DML or DQL.'),
('DBMS','MEDIUM','Reading data written by another transaction that has not yet committed is called what?','Deadlock','Dirty read','Starvation','Lost update','B','This is a dirty read, which the READ COMMITTED isolation level and above prevent.'),
('DBMS','EASY','Can a primary key column contain NULL?','Yes, any number of NULLs','Yes, but only one','Only if it has a unique index','No, never','D','A primary key must be unique and NOT NULL.');
