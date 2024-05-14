const app = require("express")();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.get("/scanner", (req, res) => {
  res.send(`%option noyywrap
  %{
  #include <stdio.h>
  %}
  %%
  integer|read|display|if|else|then|while|for|to|step { printf("Keyword: %s\n", yytext); }
  "<="|">="|"<"|">"|"=="|"#" { printf("Relational Operator: %s\n", yytext); }
  "+"|"-"|"*"|"/" { printf("Arithmetic Operator: %s\n", yytext); }
  "++" { printf("Increment Operator: %s\n", yytext); }
  "
  --" { printf("Decrement Operator: %s\n", yytext); }
  "=" { printf("Assignment Operator: %s\n", yytext); }
  "("|")"|"{"|"}"|","|";" { printf("Special Symbol: %s\n", yytext); }
  [a-zA-Z][a-zA-Z0-9_]* { printf("Identifier: %s\n", yytext); }
  [0-9]+ { printf("Number: %s\n", yytext); }
  [ \t\n]+ { /* Skip whitespace */ }
  . { /* Ignore any other symbols */ }
  %%
  int main() {
  yylex();
  return 0;
  } `);
});

app.get("/scannerwithfile", (req, res) => {
  res.send(`%{
    #include <stdio.h>
    %}
    %%
    if|for|while|read|then|else|display|step { printf("KEYWORD %s\n",yytext); }
    [<|<=|==|#|>=|>] { printf("%s: RELATIONAL operators\n",yytext); }
    "+"|"-"|"*"|"/" { printf("Arithmetic Operator: %s\n", yytext); }
    "++"|"--"|"=" { printf("Increment Operator: %s\n", yytext); }
    "integer" { printf("INTEGER %s\n",yytext); }
    [a-zA-Z][a-zA-Z0-9]* { printf("IDENTIFIER %s\n",yytext); }
    [ \t\n]+ ; /* Ignore whitespace and newline */
    [{}();,] { printf("%s: SYMBOL\n",yytext); }
    [.] { printf("ERROR: Unrecognized token\n"); }
    [0-9] { printf(“Digit: %s\n”,yytext); }
    %%
    int yywrap() {}
    int main() {
    // Open the file provided as argument
    FILE *file = fopen("file4.star.txt", "r");
    if (!file) {
    perror("file4.star.txt");
    return 1;
    }
    // Set Flex to read from the file instead of stdin
    yyin = file;
    // Start parsing
    yylex();
    // Close the file
    fclose(file);
    return 0;
    }`);
});
app.get("/parser", (req, res) => {
  res.send(`%{
    #include <stdio.h>
    #include "y.tab.h"
    
    int yylex();
    void yyerror(const char *s);
    %}
    
    %%
    [0-9]+ { yylval.num = atoi(yytext);
             return (NUMBER);}
    \n { return 0; }
    [ \t]+ ;
    . { return (yytext[0]); }
    %%
    y.y
    %{
        #include <stdio.h>
        int yylex();
        void yyerror(const char *s);
        %}
        
        %union{
        int num;
        }
        
        %token <num>NUMBER
        %left '+' '-'
        %left '*' '/'
        %type <num>AE
        %type <num>E
        
        %%
        AE:E { printf("The result is %d\n", $$); }
        E: E '+' E { $$ = $1 + $3; }
        E: E '-' E { $$ = $1 - $3; }
        E: E '*' E { $$ = $1 * $3; }
        E: E '/' E { $$ = $1 / $3; }
        E: NUMBER { $$ = $1; }
        %%
        
        int main(void)
        {
         yyparse();
         return 0;
        }
        
        void yyerror(const char *s)
        {
         printf("Error: %s", s);
        }
        bison -d y.y
        flex scanner.lex
        gcc lex.yy.c y.tab.c -W
        ./a.out`);
});

app.get("/pp", (req, res) => {
  res.send(`#include<stdio.h>
  #include<string.h>
  char prol[7][10]={"S","A","A","B","B","C","C"};
  char pror[7][10]={"A","Bb","Cd","aB","@","Cc","@"};
  char prod[7][10]={"S->A","A->Bb","A->Cd","B->aB","B->@","C->Cc","C->@"};
  char first[7][10]={"abcd","ab","cd","a@","@","c@","@"};
  char follow[7][10]={"$","$","$","a$","b$","c$","d$"};
  char table[5][6][10];
  int numr(char c)
  {
  switch(c){
  case 'S': return 0;
  case 'A': return 1;
  case 'B': return 2;
  case 'C': return 3;
  case 'a': return 0;
  case 'b': return 1;
  case 'c': return 2;
  case 'd': return 3;
  case '$': return 4;
  }
  return(2);
  }
  void main()
  {
  int i,j,k;
  for(i=0;i<5;i++)
  for(j=0;j<6;j++)
  strcpy(table[i][j]," ");
  printf("\nThe following is the predictive parsing table for the following grammar:\n");
  for(i=0;i<7;i++)
  printf("%s\n",prod[i]);
  printf("\nPredictive parsing table is\n");
  fflush(stdin);
  for(i=0;i<7;i++){
  k=strlen(first[i]);
  for(j=0;j<10;j++)
  if(first[i][j]!='@')
  strcpy(table[numr(prol[i][0])+1][numr(first[i][j])+1],prod[i]);
  }
  for(i=0;i<7;i++){
  if(strlen(pror[i])==1)
  {
  if(pror[i][0]=='@')
  {
  k=strlen(follow[i]);
  for(j=0;j<k;j++)
  strcpy(table[numr(prol[i][0])+1][numr(follow[i][j])+1],prod[i]);
  }
  }
  }
  strcpy(table[0][0]," ");
  strcpy(table[0][1],"a");
  strcpy(table[0][2],"b");
  strcpy(table[0][3],"c");
  strcpy(table[0][4],"d");
  strcpy(table[0][5],"$");
  strcpy(table[1][0],"S");
  strcpy(table[2][0],"A");
  strcpy(table[3][0],"B");
  strcpy(table[4][0],"C");
  printf("\n--------------------------------------------------------\n");
  for(i=0;i<5;i++)
  for(j=0;j<6;j++){
  printf("%-10s",table[i][j]);
  if(j==5)
  printf("\n--------------------------------------------------------\n");
  }
  }`);
});

app.get("/slr", (req, res) => {
  res.send(`#include<stdio.h>
  #include<string.h>
  #include<stdlib.h>
  #include<unistd.h>
  int i,j,k,m,n=0,o,p,ns=0,tn=0,rr=0,ch=0;
  char cread[15][10],gl[15],gr[15][10],temp,templ[15],tempr[15][10],*ptr,temp2[5];
  char dfa[15][10];
  struct states
  {
  char lhs[15],rhs[15][10];
  int n;//state number
  }I[15];
  int compstruct(struct states s1,struct states s2)
  {
  int t;
  if(s1.n!=s2.n)
  return 0;
  if( strcmp(s1.lhs,s2.lhs)!=0 )
  return 0;
  for(t=0;t<s1.n;t++)
  if( strcmp(s1.rhs[t],s2.rhs[t])!=0 )
  return 0;
  return 1;
  }
  void moreprod()
  {
  int r,s,t,l1=0,rr1=0;
  char *ptr1,read1[15][10];
  for(r=0;r<I[ns].n;r++)
  {
  ptr1=strchr(I[ns].rhs[l1],'.');
  t=ptr1-I[ns].rhs[l1];
  if( t+1==strlen(I[ns].rhs[l1]) )
  {
  l1++;
  continue;
  }
  temp=I[ns].rhs[l1][t+1];
  l1++;
  for(s=0;s<rr1;s++)
  if( temp==read1[s][0] )
  break;
  if(s==rr1)
  {
  read1[rr1][0]=temp;
  rr1++;
  }
  else
  continue;
  for(s=0;s<n;s++)
  {
  if(gl[s]==temp)
  {
  I[ns].rhs[I[ns].n][0]='.';
  I[ns].rhs[I[ns].n][1]='\0';
  strcat(I[ns].rhs[I[ns].n],gr[s]);
  I[ns].lhs[I[ns].n]=gl[s];
  I[ns].lhs[I[ns].n+1]='\0';
  I[ns].n++;
  }
  }
  }
  }
  void canonical(int l)
  {
  int t1;
  char read1[15][10],rr1=0,*ptr1;
  for(i=0;i<I[l].n;i++)
  {
  temp2[0]='.';
  ptr1=strchr(I[l].rhs[i],'.');
  t1=ptr1-I[l].rhs[i];
  if( t1+1==strlen(I[l].rhs[i]) )
  continue;
  temp2[1]=I[l].rhs[i][t1+1];
  temp2[2]='\0';
  for(j=0;j<rr1;j++)
  if( strcmp(temp2,read1[j])==0 )
  break;
  if(j==rr1)
  {
  strcpy(read1[rr1],temp2);
  read1[rr1][2]='\0';
  rr1++;
  }
  else
  continue;
  for(j=0;j<I[0].n;j++)
  {
  ptr=strstr(I[l].rhs[j],temp2);
  if( ptr )
  {
  templ[tn]=I[l].lhs[j];
  templ[tn+1]='\0';
  strcpy(tempr[tn],I[l].rhs[j]);
  tn++;
  }
  }
  for(j=0;j<tn;j++)
  {
  ptr=strchr(tempr[j],'.');
  p=ptr-tempr[j];
  tempr[j][p]=tempr[j][p+1];
  tempr[j][p+1]='.';
  I[ns].lhs[I[ns].n]=templ[j];
  I[ns].lhs[I[ns].n+1]='\0';
  strcpy(I[ns].rhs[I[ns].n],tempr[j]);
  I[ns].n++;
  }
  moreprod();
  for(j=0;j<ns;j++)
  {
  //if ( memcmp(&I[ns],&I[j],sizeof(struct states))==1 )
  if( compstruct(I[ns],I[j])==1 )
  {
  I[ns].lhs[0]='\0';
  for(k=0;k<I[ns].n;k++)
  I[ns].rhs[k][0]='\0';
  I[ns].n=0;
  dfa[l][j]=temp2[1];
  break;
  }
  }
  if(j<ns)
  {
  tn=0;
  for(j=0;j<15;j++)
  {
  templ[j]='\0';
  tempr[j][0]='\0';
  }
  continue;
  }
  dfa[l][j]=temp2[1];
  printf("\n\nI%d :",ns);
  for(j=0;j<I[ns].n;j++)
  printf("\n\t%c -> %s",I[ns].lhs[j],I[ns].rhs[j]);
  //getch();
  ns++;
  tn=0;
  for(j=0;j<15;j++)
  {
  templ[j]='\0';
  tempr[j][0]='\0';
  }
  }
  }
  int main()
  {
  FILE *f;
  int l;
  //clrscr();
  for(i=0;i<15;i++)
  {
  I[i].n=0;
  I[i].lhs[0]='\0';
  I[i].rhs[0][0]='\0';
  dfa[i][0]= '\0';
  }
  f=fopen("tab6.txt","r");
  while(!feof(f))
  {
  fscanf(f,"%c",&gl[n]);
  fscanf(f,"%s\n",gr[n]);
  n++;
  }
  printf("THE GRAMMAR IS AS FOLLOWS\n");
  for(i=0;i<n;i++)
  printf("\t\t\t\t%c -> %s\n",gl[i],gr[i]);
  I[0].lhs[0]='Z';
  strcpy(I[0].rhs[0],".S");
  I[0].n++;
  l=0;
  for(i=0;i<n;i++)
  {
  temp=I[0].rhs[l][1];
  l++;
  for(j=0;j<rr;j++)
  if( temp==cread[j][0] )
  break;
  if(j==rr)
  {
  cread[rr][0]=temp;
  rr++;
  }
  else
  continue;
  for(j=0;j<n;j++)
  {
  if(gl[j]==temp)
  {
  I[0].rhs[I[0].n][0]='.';
  strcat(I[0].rhs[I[0].n],gr[j]);
  I[0].lhs[I[0].n]=gl[j];
  I[0].n++;
  }
  }
  }
  ns++;
  printf("\nI%d :\n",ns-1);
  for(i=0;i<I[0].n;i++)
  printf("\t%c -> %s\n",I[0].lhs[i],I[0].rhs[i]);
  for(l=0;l<ns;l++)
  canonical(l);
  printf("\n\n\t\tPRESS ANY KEY FOR TABLE");
  //getch();
  //clrscr();
  printf("\t\t\t\nDFA TABLE IS AS FOLLOWS\n\n\n");
  for(i=0;i<ns;i++)
  {
  printf("I%d : ",i);
  for(j=0;j<ns;j++)
  if(dfa[i][j]!='\0')
  printf("'%c'->I%d | ",dfa[i][j],j);
  printf("\n\n\n");
  }
  printf("\n\n\n\t\tPRESS ANY KEY TO EXIT");
  //getch();
  }
  // Input File tab6.txt For SLR Parser:
  // S S+T
  // S T
  // T T*F
  // T F
  // F (S)
  // F t
    `);
});

app.get("/syntax", (req, res) => {
  res.send(`#include <iostream>
  #include <string>
  #include <stack>
  #include <cctype>
  using namespace std;
  // Node for syntax tree
  struct Node {
  char data;
  Node* left;
  Node* right;
  Node(char data) : data(data), left(nullptr), right(nullptr) {}
  };
  // Function to check if a character is an operator
  bool isOperator(char c) {
  return c == '+' || c == '-' || c == '*' || c == '/';
  }
  // Function to construct syntax tree from postfix expression
  Node* constructSyntaxTree(const string& postfix) {
  stack<Node*> stack;
  for (char c : postfix) {
  if (isalnum(c)) {
  stack.push(new Node(c));
  } else if (isOperator(c)) {
  Node* rightOperand = stack.top();
  stack.pop();
  Node* leftOperand = stack.top();
  stack.pop();
  Node* newNode = new Node(c);
  newNode->left = leftOperand;
  newNode->right = rightOperand;
  stack.push(newNode);
  }
  }
  return stack.top();
  }
  // Function to perform arithmetic operation based on operator
  int performOperation(char operation, int operand1, int operand2) {
  switch (operation) {
  case '+':
  return operand1 + operand2;
  case '-':
  return operand1 - operand2;
  case '*':
  return operand1 * operand2;
  case '/':
  return operand1 / operand2;
  default:
  cerr << "Invalid operator!" << endl;
  return 0;
  }
  }
  // Function to evaluate syntax tree recursively
  int evaluateSyntaxTree(Node* root) {
  if (!root)
  return 0;
  if (isalnum(root->data)) {
  return root->data - '0'; // Convert char to int
  }
  int leftValue = evaluateSyntaxTree(root->left);
  int rightValue = evaluateSyntaxTree(root->right);
  return performOperation(root->data, leftValue, rightValue);
  }
  int main() {
  string postfixExpression;
  cout << "Enter a postfix expression: ";
  cin >> postfixExpression;
  Node* syntaxTreeRoot = constructSyntaxTree(postfixExpression);
  int result = evaluateSyntaxTree(syntaxTreeRoot);
  cout << "Result: " << result << endl;
  return 0;
  }`);
});

app.get("/code", (req, res) => {
  res.send(`
#include <stdio.h>
int labelIndex = 0;
char* generateLabel() {
static char label[10];
sprintf(label, "L%d", labelIndex++);
return label;
}
void generateIfCode(char* condition, char* trueLabel, char* falseLabel) {
printf("IF %s GOTO %s ELSE GOTO %s\n", condition, trueLabel, falseLabel);
}
void generateWhileCode(char* condition, char* startLabel, char* endLabel) {
printf("%s:\n", startLabel);
printf("IF %s GOTO %s ELSE GOTO %s\n", condition, endLabel, endLabel);
}
int main() {
char* ifCondition = "x < y";
char* ifTrueLabel = generateLabel();
char* ifFalseLabel = generateLabel();
generateIfCode(ifCondition, ifTrueLabel, ifFalseLabel); 
printf("%s: printf(\"x is less than y\\n\");\n", ifTrueLabel); 
printf("%s: printf(\"x is not less than y\\n\");\n", ifFalseLabel); 
char* whileCondition = "i < 5";
char* whileStartLabel = generateLabel(); 
char* whileEndLabel = generateLabel();
generateWhileCode(whileCondition, whileStartLabel, whileEndLabel);
printf("%s: printf(\"i: %%d\\n\", i);\n", whileStartLabel); 
printf("i++;\n"); 
printf("GOTO %s;\n", whileStartLabel); 
printf("%s:\n", whileEndLabel); 
return 0;
}
 `);
});

app.get("/leftr", (req, res) => {
  res.send(` 
  #include<stdio.h>  
  #include<string.h>  
    #define SIZE 10  
    int main () {  
         char non_terminal;  
         char beta,alpha;  
         int num;  
         char production[10][SIZE];  
         int index=3; /* starting of the string following "->" */  
         printf("Enter Number of Production : ");  
         scanf("%d",&num);  
         printf("Enter the grammar as E->E-A :\n");  
         for(int i=0;i<num;i++){  
              scanf("%s",production[i]);  
         }  
        for(int i=0;i<num;i++){  
              printf("\nGRAMMAR : : : %s",production[i]);  
              non_terminal=production[i][0];  
              if(non_terminal==production[i][index]) {  
                   alpha=production[i][index+1];  
                   printf(" is left recursive.\n");  
                   while(production[i][index]!=0 && production[i][index]!='|') 
                    index++;  
                   if(production[i][index]!=0) {  
                        beta=production[i][index+1];  
                        printf("Grammar without left recursion:\n");  
                        printf("%c->%c%c\'",non_terminal,beta,non_terminal);  
                        printf("\n%c\'->%c%c\'|E\n",non_terminal,alpha,non_terminal);  
                   }  
                   else  
                        printf(" can't be reduced\n");  
              }  
              else  
                   printf(" is not left recursive.\n");  
              index=3;  
         }  
    }    `);
});

app.get("/leftf", (req, res) => {
  res.send(`
#include <stdio.h>
#include <string.h>

int main()
{
    char gram[20], part1[20], part2[20], modifiedGram[20], newGram[20], tempGram[20];
    int i, j = 0, k = 0, l = 0, pos;
    printf("Enter Production : A->");
    fgets(gram, sizeof(gram), stdin); // Safely read input
    gram[strcspn(gram, "\n")] = 0;    // Remove newline character added by fgets

    for (i = 0; gram[i] != '|' && gram[i] != '\0'; i++, j++)
    {
        part1[j] = gram[i];
    }
    part1[j] = '\0';
    for (j = ++i, i = 0; gram[j] != '\0'; j++, i++)
    {
        part2[i] = gram[j];
    }
    part2[i] = '\0';

    for (i = 0; i < strlen(part1) && i < strlen(part2); i++)
    {
        if (part1[i] == part2[i])
        {
            modifiedGram[k] = part1[i];
            k++;
            pos = i + 1;
        }
    }

    for (i = pos, j = 0; part1[i] != '\0'; i++, j++)
    {
        newGram[j] = part1[i];
    }
    newGram[j++] = '|';
    for (i = pos; part2[i] != '\0'; i++, j++)
    {
        newGram[j] = part2[i];
    }
    newGram[j] = '\0';

    modifiedGram[k] = 'X';
    modifiedGram[++k] = '\0';

    printf("\nGrammar Without Left Factoring :\n");
    printf(" A->%s", modifiedGram);
    printf("\n X->%s\n", newGram);

    return 0;
} `);
});

app.get("/first", (req, res) => {
  res.send(`
  #include <stdio.h>
  #include <stdlib.h>
  #include <string.h>
  
  char **productions;
  
  int findPos(char NonTer) {
      int i = 0;
      while (productions[i][0] != NonTer)
          i++;
      return i;
  }
  
  char* findGenerating(char Ter) {
      int i = 0;
      while (productions[i][0] != Ter)
          i++;
      return productions[i];
  }
  
  char findFirst(char *prod) {
      int i;
      for (i = 3; i < strlen(prod); i++) {
          if ((prod[i] >= 'a' && prod[i] <= 'z') || prod[i] == ')' || prod[i] == '(' || prod[i] == ',') {
              printf(" %c ", prod[i]);
              while (prod[i] != '/' && prod[i] != '\0')
                  i++;
              return prod[i]; // return the last processed character, for example
          } else if (prod[i] >= 'A' && prod[i] <= 'Z') {
              printf("  %c", findFirst(productions[findPos(prod[i])]));
              return prod[i];  // return the non-terminal or another meaningful character
          } else if (prod[i] == '#') {
              printf("  #");
              return '#'; // return when it's a specific symbol like '#'
          }
      }
      return '\0'; // default return when none of the conditions are met
  }
  
  void findFollow(char GeneratingSymbol, int n) {
      int i, j = 0;
      if (GeneratingSymbol == 'S')
          printf(" $ ");
      for (j = 0; j < n; j++) {
          for (i = 3; i < strlen(productions[j]); i++) {
              if (GeneratingSymbol == productions[j][i]) {
                  if ((productions[j][i + 1] >= 'a' && productions[j][i + 1] <= 'z') || productions[j][i + 1] == ')' || productions[j][i + 1] == '(' || productions[j][i + 1] == ',') {
                      printf(" %c ", productions[j][i + 1]);
                  } else if (productions[j][i + 1] >= 'A' && productions[j][i + 1] <= 'Z') {
                      char ans = findFirst(findGenerating(productions[j][i + 1]));
                  } else if (i + 1 == strlen(productions[j])) {
                      findFollow(productions[j][0], n);
                  } else {
                      continue;
                  }
              }
          }
      }
  }
  
  int main() {
      int i, n;
      printf("Enter the number of productions: ");
      scanf("%d\n", &n);
      productions = (char**) malloc(sizeof(char*) * n);
      for (i = 0; i < n; i++)
          productions[i] = (char*) malloc(sizeof(char) * 20);
  
      char temp[20];  // Buffer to read input
      for (i = 0; i < n; i++) {
          fgets(temp, 20, stdin);
          temp[strcspn(temp, "\n")] = 0;  // Remove newline character
          strcpy(productions[i], temp);
      }
  
      // First Computation
      for (i = 0; i < n; i++) {
          printf("\nFIRST(%c)={  ", productions[i][0]);
          char ans = findFirst(productions[i]);
          printf("}\n");
      }
  
      for (i = 0; i < n; i++) {
          printf("\nFOLLOW(%c)={", productions[i][0]);
          findFollow(productions[i][0], n);
          printf("}\n");
      }
      printf("\nThe End");
      return 0;
  } `);
});

app.get("/java", (req, res) => {
  res.send(`
    import java.util.Scanner;

    public class PrimeCheck {
        public static void main(String[] args) {
            Scanner scanner = new Scanner(System.in);  // Create a Scanner object
            System.out.println("Enter a number to check if it's prime:");
    
            int number = scanner.nextInt();  // Read user input
            int primeFlag = 1;  // Use an integer to indicate primality: 1 for prime, 0 for not prime
    
            // Handling edge case for numbers less than 2
            if (number < 2) {
                primeFlag = 0;
            }
    
            // Check for factors up to the square root of the number
            for (int i = 2; i * i <= number; i++) {
                if (number % i == 0) {
                    primeFlag = 0;  // Factor found, number is not prime
                    break;  // Exit the loop early
                }
            }
    
            if (primeFlag == 1) {
                System.out.println(number + " is a prime number.");
            } else {
                System.out.println(number + " is not a prime number.");
            }
    
            scanner.close();  // Close the scanner
        }
    }
    import java.util.Scanner;

class Palindrome {
    public static void main(String args[]) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter a number to check for palindrome");
        int n = sc.nextInt();
        int reversed = 0;
        int original = n;

        while (n != 0) {
            int digit = n % 10;
            reversed = reversed * 10 + digit;
            n = n / 10;
        }

        if (original == reversed) {
            System.out.println("Palindrome");
        } else {
            System.out.println("Not a palindrome");
        }
    }
}

import java.util.Scanner; // Import the Scanner class

class FactorialExample {
    public static void main(String args[]) {
        Scanner scanner = new Scanner(System.in);  // Create a Scanner object for input
        System.out.println("Enter a number to calculate its factorial:");

        int number = scanner.nextInt();  // Read user input as an integer
        int fact = 1;

        for (int i = 1; i <= number; i++) {
            fact *= i;
        }

        System.out.println("Factorial of " + number + " is: " + fact);

        scanner.close();  // Close the scanner
    }
}

import java.util.Scanner;

public class SecondSmallestFinder {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("Enter the number of elements in the array:");
        int n = scanner.nextInt();  // Number of elements in the array
        int[] array = new int[n];
        
        System.out.println("Enter the elements of the array:");
        for (int i = 0; i < n; i++) {
            array[i] = scanner.nextInt();  // Read each element into the array
        }
        
        if (n < 2) {
            System.out.println("Array must contain at least two elements.");
        } else {
            int first = array[0];
            int second = array[1];
            
            for (int i = 1; i < n; i++) {
                if (array[i] > first) {
                    second = first;
                    first = array[i];
                } else if (array[i] != first && array[i] > second) {
                    second = array[i];
                }
            }
            
            if (first==second) {
                System.out.println("There is no second smallest number because all elements are the same.");
            } else {
                System.out.println("The second smallest number is: " + second);
            }
        }
        
        scanner.close();
    }
}`);
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// hope this works
