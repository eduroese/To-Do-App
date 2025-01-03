/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const saltRounds = 10;

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  user: { type: String, required: true },
  completed: { type: Number, enum: [0, 1], required: true },
  category: { type: String },
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
const Categories =
  mongoose.models.Categories || mongoose.model("Categories", categoriesSchema);

async function connectToDatabase() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect("mongodb://127.0.0.1:27017/ToDoApp");
  }
}

async function handleTaskRequest(
  req: NextRequest,
  {
    title,
    user,
    completed,
    category,
  }: { title: string; user: string; completed: Number; category: string }
) {
  await connectToDatabase();
  const task = new Tasks({ title, user, completed, category: "" });
  return await task.save();
}

async function handleUserRegistration({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  await connectToDatabase();
  const existingUser = await User.findOne({ username });
  if (existingUser) throw new Error("Usuário já registrado");
  const hashedPassword = await bcrypt.hash(
    password,
    await bcrypt.genSalt(saltRounds)
  );
  const newUser = new User({ username, password: hashedPassword });
  return await newUser.save();
}

async function handleUserLogin({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  await connectToDatabase();
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password)))
    throw new Error("Credenciais inválidas");
  return user;
}

async function handleCategoryRequest({
  name,
  color,
  user,
}: {
  name: string;
  color: string;
  user: string;
}) {
  await connectToDatabase();
  const category = new Categories({ name, color, user });
  return await category.save();
}

async function updateDocumentById(
  model: any,
  id: string | Number | undefined,
  updateData: any
) {
  return await model.findByIdAndUpdate(id, updateData, { new: true });
}

async function deleteDocumentById(model: any, id: string | Number) {
  return await model.findByIdAndDelete(id);
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const userId = new URL(req.url).searchParams.get("user");
    if (!userId)
      return NextResponse.json(
        { error: "O parâmetro 'user' é obrigatório" },
        { status: 400 }
      );

    const [tasks, categories] = await Promise.all([
      Tasks.find({ user: userId }),
      Categories.find({ user: userId }),
    ]);

    return NextResponse.json({ tasks, categories });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    let response;

    switch (data.type) {
      case "Task":
        response = await handleTaskRequest(req, data);
        break;
      case "Register":
        response = await handleUserRegistration(data);
        break;
      case "Login":
        response = await handleUserLogin(data);
        response = { message: "Login bem-sucedido", user: response.username };
        break;
      case "Category":
        response = await handleCategoryRequest(data);
        break;
      default:
        return NextResponse.json(
          { error: "Tipo de requisição inválido" },
          { status: 400 }
        );
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      error: "Erro ao processar requisição",
      status: 500,
    });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const id = req.nextUrl.pathname.split("/").pop();
    let model;

    switch (data.type) {
      case "Task":
        model = Tasks;
        break;
      case "Category":
        model = Categories;
        break;
      default:
        return NextResponse.json(
          { error: "Tipo de requisição inválido" },
          { status: 400 }
        );
    }

    const updatedDoc = await updateDocumentById(model, id, data);
    if (!updatedDoc)
      return NextResponse.json(
        { error: `${data.type} não encontrado` },
        { status: 404 }
      );

    return NextResponse.json(updatedDoc);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao atualizar documento" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { type } = await req.json();
    const id = new URL(req.url).pathname.split("/").pop();
    if (!id)
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

    let model;
    switch (type) {
      case "Task":
        model = Tasks;
        break;
      case "Category":
        model = Categories;
        break;
      default:
        return NextResponse.json(
          { error: "Tipo de requisição inválido" },
          { status: 400 }
        );
    }

    const deletedDoc = await deleteDocumentById(model, id);
    if (!deletedDoc)
      return NextResponse.json(
        { error: `${type} não encontrado` },
        { status: 404 }
      );

    return NextResponse.json({ message: `${type} deletado com sucesso` });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao deletar documento" },
      { status: 500 }
    );
  }
}
