<?php

namespace Tests\Feature;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TodoApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_a_todo(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/todos', [
            'title' => 'Write tests',
            'description' => 'Create Todo API coverage',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Write tests')
            ->assertJsonPath('data.user_id', $user->id);

        $this->assertDatabaseHas('todos', [
            'title' => 'Write tests',
            'user_id' => $user->id,
        ]);
    }

    public function test_authenticated_user_can_view_their_todos(): void
    {
        $user = User::factory()->create();
        Todo::factory()->count(2)->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/todos');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_authenticated_user_can_update_their_todo(): void
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->create(['user_id' => $user->id, 'title' => 'Old']);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/todos/' . $todo->id, [
            'title' => 'Updated title',
            'description' => 'Updated description',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated title');

        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
            'title' => 'Updated title',
        ]);
    }

    public function test_authenticated_user_can_delete_their_todo(): void
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson('/api/todos/' . $todo->id);

        $response->assertStatus(200);

        $this->assertDatabaseMissing('todos', [
            'id' => $todo->id,
        ]);
    }

    public function test_user_can_mark_todo_completed_and_pending(): void
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->create(['user_id' => $user->id, 'completed' => false]);

        Sanctum::actingAs($user);

        $markCompleted = $this->patchJson('/api/todos/' . $todo->id . '/complete');
        $markCompleted->assertStatus(200)
            ->assertJsonPath('data.completed', true);

        $markPending = $this->patchJson('/api/todos/' . $todo->id . '/pending');
        $markPending->assertStatus(200)
            ->assertJsonPath('data.completed', false);
    }

    public function test_search_works(): void
    {
        $user = User::factory()->create();
        Todo::factory()->create(['user_id' => $user->id, 'title' => 'Alpha title']);
        Todo::factory()->create(['user_id' => $user->id, 'title' => 'Beta title']);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/todos?search=Alpha');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_filtering_works(): void
    {
        $user = User::factory()->create();
        Todo::factory()->create(['user_id' => $user->id, 'completed' => true]);
        Todo::factory()->create(['user_id' => $user->id, 'completed' => false]);

        Sanctum::actingAs($user);

        $completed = $this->getJson('/api/todos?status=completed');
        $completed->assertStatus(200)->assertJsonCount(1, 'data');

        $pending = $this->getJson('/api/todos?status=pending');
        $pending->assertStatus(200)->assertJsonCount(1, 'data');
    }

    public function test_unauthenticated_requests_are_rejected(): void
    {
        $response = $this->getJson('/api/todos');

        $response->assertStatus(401);
    }

    public function test_user_cannot_access_another_users_todo(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $todo = Todo::factory()->create(['user_id' => $owner->id]);

        Sanctum::actingAs($other);

        $response = $this->getJson('/api/todos/' . $todo->id);

        $response->assertStatus(403);
    }
}
