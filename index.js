const app = require("express")();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.get("/exp3", (req, res) => {
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

app.get("/exp4", (req, res) => {
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
app.get("/exp5", (req, res) => {
  res.send(`%{
    #include <stdio.h>
    #include "parser.tab.h"
    %}
    %option noyywrap
    %%
    [0-9]+ { yylval.num = atoi(yytext); return NUMBER; }
    \n { return 0; }
    . { return yytext[0]; }
    %%
    Parser file
    %{
    #include <stdio.h>
    void yyerror(const char *s);
    int yylex(void);
    int yyparse(void);
    %}
    %union {
    int num;
    }
    %token <num> NUMBER
    %left '+' '-
    '
    %left '' '/' // Changed to left associativity for '' and '/'
    %type <num> AE
    %type <num> E
    %%
    AE : E { printf("The result is %d\n", $$); }
    E : E '' E { $$ = $1 * $3; } // Higher precedence for '' and '/'
    | E '/' E { $$ = $1 / $3; } // Higher precedence for '*' and '/'
    | E '+' E { $$ = $1 + $3; }
    | E '-' E { $$ = $1 - $3; }
    | NUMBER { $$ = $1; }
    ;
    %%
    int main() {
    yyparse();
    return 0;
    }
    void yyerror(const char *s) {
    printf("Error: %s\n", s);
    }`);
});

app.get("/exp6", (req, res) => {
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

app.get("/exp7", (req, res) => {
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

app.get("/exp9", (req, res) => {
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

app.get("/exp10", (req, res) => {
  res.send(`#include <iostream>
  #include <string>
  #include <sstream>
  using namespace std;
  // Function to generate new label
  string newLabel() {
  static int labelCounter = 0;
  stringstream ss;
  ss << "L" << labelCounter++;
  return ss.str();
  }
  // Function to generate intermediate code for if construct
  string generateIf(string E, string S1_CODE, string S_NEXT) {
  string TRUE = newLabel();
  string FALSE = S_NEXT;
  string code = E + " TRUE: " + TRUE + "\n" +
  " FALSE: " + FALSE + "\n" +
  S1_CODE + "\n" +
  TRUE + ": \n";
  return code;
  }
  // Function to generate intermediate code for if-else construct
  string generateIfElse(string E, string S1_CODE, string S2_CODE, string S_NEXT) {
  string TRUE = newLabel();
  string FALSE = newLabel();
  string code = E + " TRUE: " + TRUE + "\n" +
  " FALSE: " + FALSE + "\n" +
  S1_CODE + "\n" +
  "goto " + S_NEXT + "\n" +
  FALSE + ": \n" +
  S2_CODE + "\n";
  return code;
  }
  // Function to generate intermediate code for while construct
  string generateWhile(string E, string S1_CODE) {
  string BEGIN = newLabel();
  string TRUE = newLabel();
  string NEXT = newLabel();
  string code = BEGIN + ": \n" +
  E + " TRUE: " + TRUE + "\n" +
  " FALSE: " + NEXT + "\n" +
  S1_CODE + "\n" +
  "goto " + BEGIN + "\n" +
  NEXT + ": \n";
  return code;
  }
  int main() {
  // Example usage:
  string E = "if (condition)";
  string S1_CODE = "cout << \"Condition is true\";";
  string S2_CODE = "cout << \"Condition is false\";";
  string S_NEXT = "end;";
  // Generate intermediate code for if-else construct
  string ifElseCode = generateIfElse(E, S1_CODE, S2_CODE, S_NEXT);
  cout << "Intermediate code for if-else:\n" << ifElseCode << endl;
  // Generate intermediate code for if construct
  string ifCode = generateIf(E, S1_CODE, S_NEXT);
  cout << "Intermediate code for if:\n" << ifCode << endl;
  // Generate intermediate code for while construct
  string whileCode = generateWhile(E, S1_CODE);
  cout << "Intermediate code for while:\n" << whileCode << endl;
  return 0;
  } `);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// hope this works
