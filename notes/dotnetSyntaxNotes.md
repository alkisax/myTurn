- Linq

```csharp
var totalSum = arr.Sum()
var result = arr.Where(n => n > 5).ToList();
var result = arr.Select(n => n * 2);
var count = arr.Count();
var count = arr.Count(n => n % 2 == 0);
bool hasFive = arr.Contains(5);
var firstEven = arr.First(n => n % 2 == 0);
var min = arr.Min();
var max = arr.Max();
var unique = arr.Distinct();
```
- arrays
```csharp
var arr = new string[24];
int num = int.Parse(ch.ToString());
var numbers = new List<int>();
var arr = str.Split(' ');
var chars = str.ToCharArray();
string result = string.Join("", arr);
var totalArr = s1Arr.Concat(s2Arr).ToArray();
```

- strings
```csharp

char upper = char.ToUpper(ch);
int okto = int.Parse('8'.ToString());
digit = (char)(2);
int n = ch - 'a'; // κάνω τον α=0 β=1
```

- minor
```csharp
Console.WriteLine(string.Join(", ", wordsArr)); // see arr elements
```

- generics
```csharp
EqualityComparer<T>.Default.Equals(iterArr[i - 1], iterArr[i])
```

- RegEx
```csharp
if (Regex.IsMatch(ch.ToString(), "[a-m]"))
```

- basic dotnet
```bash
dotnet new console -n HelloWorld
dotnet add package MorseSharp
```