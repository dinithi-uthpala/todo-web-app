<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Todo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TodoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Todo::query()->where('user_id', $request->user()->id);

        if ($request->filled('search')) {
            $keyword = $request->string('search');
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'LIKE', "%{$keyword}%")
                  ->orWhere('description', 'LIKE', "%{$keyword}%");
            });
        }

        if ($request->filled('status')) {
            $status = $request->query('status');

            if ($status === 'completed') {
                $query->where('completed', true);
            } elseif ($status === 'pending') {
                $query->where('completed', false);
            } else {
                return response()->json([
                    'message' => 'Invalid status filter',
                    'errors' => [
                        'status' => ['The status filter must be completed or pending.'],
                    ],
                ], 422);
            }
        }

        $todos = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $todos,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'completed' => ['sometimes', 'boolean'],
        ]);

        $todo = Todo::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'completed' => $validated['completed'] ?? false,
        ]);

        return response()->json([
            'message' => 'Todo created successfully',
            'data' => $todo,
        ], 201);
    }

    public function show(Request $request, Todo $todo): JsonResponse
    {
        if ($todo->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'data' => $todo,
        ]);
    }

    public function update(Request $request, Todo $todo): JsonResponse
    {
        if ($todo->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'completed' => ['sometimes', 'boolean'],
        ]);

        $todo->fill($validated);
        $todo->save();

        return response()->json([
            'message' => 'Todo updated successfully',
            'data' => $todo,
        ]);
    }

    public function destroy(Request $request, Todo $todo): JsonResponse
    {
        if ($todo->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $todo->delete();

        return response()->json([
            'message' => 'Todo deleted successfully',
        ]);
    }

    public function markCompleted(Request $request, Todo $todo): JsonResponse
    {
        if ($todo->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $todo->completed = true;
        $todo->save();

        return response()->json([
            'message' => 'Todo marked as completed',
            'data' => $todo,
        ]);
    }

    public function markPending(Request $request, Todo $todo): JsonResponse
    {
        if ($todo->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $todo->completed = false;
        $todo->save();

        return response()->json([
            'message' => 'Todo marked as pending',
            'data' => $todo,
        ]);
    }
}
