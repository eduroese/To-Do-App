import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const saltRounds = 10;

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  user: { type: String, required: true },
  completed: { type: Number, enum: [0, 1], required: true },
  category: { type: String, required: false },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const categoriesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, required: true },
  user: { type: String, required: true },
});

const Tasks = mongoose.models.Task || mongoose.model("Task", taskSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Categories = mongoose.models.Categories || mongoose.model("Categories", categoriesSchema);

async function connectToDatabase() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ToDoApp");
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user');

    if (!userId) {
      return NextResponse.json(
        { error: "O parâmetro 'user' é obrigatório" },
        { status: 400 }
      );
    }

    const categoriesUser = await Categories.find({ user: userId });
    const tasks = await Tasks.find({ user: userId });

    return NextResponse.json({
      tasks: tasks,
      categories: categoriesUser,
    });
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tarefas" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { title, user, completed, type, username, password, name, color, category } = await req.json();

  if (type === "Task") {
    try {
      await connectToDatabase();

      const task = new Tasks({ title, user, completed, category });
      const savedTask = await task.save();

      return NextResponse.json(savedTask, { status: 201 });
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      return NextResponse.json({ error: "Erro ao adicionar tarefa" }, { status: 500 });
    }
  } else if (type === "Register") {
    try {
      await connectToDatabase();
    
      if (!username || !password) {
        return NextResponse.json(
          { error: "Os campos 'username' e 'password' são obrigatórios" },
          { status: 400 }
        );
      }
  
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return NextResponse.json({ error: "Usuário já registrado" }, { status: 400 });
      }
  
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({ username, password: hashedPassword });
      const savedUser = await newUser.save();
  
      return NextResponse.json(savedUser, { status: 201 });
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      return NextResponse.json({ error: "Erro ao registrar usuário" }, { status: 500 });
    }
  }else if(type == "Login"){
    try {
      await connectToDatabase();
  
      if (!username || !password) {
        return NextResponse.json(
          { error: "Os campos 'username' e 'password' são obrigatórios" },
          { status: 400 }
        );
      }
  
      const existingUser = await User.findOne({ username });
      const storedHashPassword =  await bcrypt.compare(password, existingUser.password);
  
      if (!existingUser) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
      }
  
      if (!storedHashPassword) {
        return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
      }
  
      return NextResponse.json(
        { message: "Login bem-sucedido", user: existingUser.username},
        { status: 200 }
      );
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      return NextResponse.json({ error: "Erro ao realizar login" }, { status: 500 });
    }
  }else if(type == "Category"){
    try {
      await connectToDatabase();
  
      const newCategory = new Categories({ name, color, user });
      const savedCategory = await newCategory.save();

      return NextResponse.json(savedCategory, { status: 201 });
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      return NextResponse.json({ error: "Erro ao salvar categoria" }, { status: 500 });
    }
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { completed, type, name, color, category } = await req.json();

  if(type == "Task"){
  try {
    await connectToDatabase();

    const updatedTask = await Tasks.findByIdAndUpdate(
      params.id,
      { completed, category },
      { new: true }
    );

    if (!updatedTask) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar tarefa" }, { status: 500 });
  }
}else if(type == "Category"){
  try {
    await connectToDatabase();

    const updatedCategory = await Categories.findByIdAndUpdate(
      params.id,
      { name, color },
      { new: true }
    );

    if (!updatedCategory) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar tarefa" }, { status: 500 });
  }
}
}

export async function DELETE(req: NextRequest) {
    const {type} = await req.json();

    if(type == "Task"){
    try {
      const url = new URL(req.url);
      const id = url.pathname.split("/").pop();

      if (!id) {
        return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
      }

      await connectToDatabase();

      const deletedTask = await Tasks.findByIdAndDelete(id);

      if (!deletedTask) {
        return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
      }

      return NextResponse.json({ message: "Tarefa deletada com sucesso" }, { status: 200 });
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      return NextResponse.json({ error: "Erro ao deletar tarefa" }, { status: 500 });
    }
  }else if(type == "Category"){
    try {
      const url = new URL(req.url);
      const id = url.pathname.split("/").pop();

      if (!id) {
        return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
      }

      await connectToDatabase();

      const deletedCategory = await Categories.findByIdAndDelete(id);

      if (!deletedCategory) {
        return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
      }

      return NextResponse.json({ message: "Tarefa deletada com sucesso" }, { status: 200 });
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      return NextResponse.json({ error: "Erro ao deletar tarefa" }, { status: 500 });
    }
  }
}