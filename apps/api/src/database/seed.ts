import 'dotenv/config';
import { Sequelize } from 'sequelize';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env['DB_HOST'] ?? 'localhost',
  port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
  username: process.env['DB_USERNAME'] ?? 'postgres',
  password: process.env['DB_PASSWORD'] ?? 'postgres',
  database: process.env['DB_NAME'] ?? 'pet_adoption',
  logging: false,
});

async function seed(): Promise<void> {
  await sequelize.authenticate();

  const staffHash = await bcrypt.hash('staffpass123', 12);
  const userHash = await bcrypt.hash('userpass123', 12);

  const staffId = randomUUID();
  const userId1 = randomUUID();
  const userId2 = randomUUID();

  await sequelize.query(`
    INSERT INTO users (id, name, email, password, role, created_at, updated_at)
    VALUES
      ('${staffId}', 'Staff Admin', 'staff@petadopt.io', '${staffHash}', 'staff', NOW(), NOW()),
      ('${userId1}', 'Alice Doe', 'alice@example.com', '${userHash}', 'user', NOW(), NOW()),
      ('${userId2}', 'Bob Smith', 'bob@example.com', '${userHash}', 'user', NOW(), NOW())
    ON CONFLICT (email) DO NOTHING;
  `);

  const pets = [
    { name: 'Luna',   species: 'dog',    breed: 'Labrador',         age: 2, description: 'Playful and energetic girl who loves fetch.' },
    { name: 'Mochi',  species: 'cat',    breed: 'Siamese',          age: 3, description: 'Quiet and affectionate indoor cat.' },
    { name: 'Rex',    species: 'dog',    breed: 'German Shepherd',  age: 4, description: 'Loyal, trained, great with kids.' },
    { name: 'Bella',  species: 'cat',    breed: 'Persian',          age: 1, description: 'Fluffy kitten, loves to cuddle.' },
    { name: 'Buddy',  species: 'dog',    breed: 'Golden Retriever', age: 5, description: 'Super friendly and house-trained.' },
    { name: 'Coco',   species: 'rabbit', breed: 'Holland Lop',      age: 1, description: 'Small and gentle, great for apartments.' },
    { name: 'Max',    species: 'dog',    breed: 'Beagle',           age: 3, description: 'Curious nose, loves outdoor adventures.' },
    { name: 'Nala',   species: 'cat',    breed: 'Maine Coon',       age: 2, description: 'Big, friendly, and very chatty.' },
    { name: 'Pebble', species: 'rabbit', breed: 'Lionhead',         age: 2, description: 'Gentle and easy to care for.' },
    { name: 'Shadow', species: 'dog',    breed: 'Border Collie',    age: 1, description: 'Smart and needs lots of stimulation.' },
  ];

  for (const pet of pets) {
    const desc = pet.description.replace(/'/g, "''");
    await sequelize.query(`
      INSERT INTO pets (id, name, species, breed, age, description, status, created_at, updated_at)
      VALUES ('${randomUUID()}', '${pet.name}', '${pet.species}', '${pet.breed}', ${pet.age}, '${desc}', 'available', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
  }

  await sequelize.close();
  process.stdout.write('Seed completed.\n');
}

seed().catch((err: unknown) => {
  process.stderr.write(`Seed failed: ${String(err)}\n`);
  process.exit(1);
});
