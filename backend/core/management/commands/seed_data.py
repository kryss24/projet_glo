from django.core.management.base import BaseCommand
from django.db import transaction
from accounts.models import User, StudentProfile
from catalog.models import Institution, Field
from orientation.models import Question
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Seeds the database with initial data for development.'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding database..."))

        # Clear existing data (optional, but good for consistent seeding)
        # self.clear_data()

        self.create_users()
        self.create_institutions_and_fields()
        self.create_questions()

        self.stdout.write(self.style.SUCCESS("Database seeding complete."))

    def clear_data(self):
        self.stdout.write(self.style.NOTICE("Clearing existing data..."))
        User.objects.all().delete()
        Institution.objects.all().delete()
        Field.objects.all().delete()
        Question.objects.all().delete()
        self.stdout.write(self.style.NOTICE("Data cleared."))

    def create_users(self):
        self.stdout.write(self.style.NOTICE("Creating users..."))
        
        # Admin User
        if not User.objects.filter(username='admin').exists():
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@enspd.cm',
                password='admin123',
                first_name='Admin',
                last_name='User',
                role='admin'
            )
            self.stdout.write(self.style.SUCCESS(f"Created admin: {admin_user.username}"))

        # Advisor User
        if not User.objects.filter(username='conseiller').exists():
            advisor_user = User.objects.create_user(
                username='conseiller',
                email='conseiller@enspd.cm',
                password='conseil123',
                first_name='Conseiller',
                last_name='User',
                role='advisor'
            )
            self.stdout.write(self.style.SUCCESS(f"Created advisor: {advisor_user.username}"))

        # Student User
        if not User.objects.filter(username='etudiant').exists():
            student_user = User.objects.create_user(
                username='etudiant',
                email='etudiant@enspd.cm',
                password='etudiant123',
                first_name='Étudiant',
                last_name='User',
                role='student'
            )
            StudentProfile.objects.create(user=student_user)
            self.stdout.write(self.style.SUCCESS(f"Created student: {student_user.username} and profile"))

        self.stdout.write(self.style.NOTICE("Users checked/created."))

    def create_institutions_and_fields(self):
        self.stdout.write(self.style.NOTICE("Creating institutions and fields..."))

        enspd, _ = Institution.objects.get_or_create(name='École Nationale Supérieure Polytechnique de Douala', defaults={'city':'Douala', 'type':'public', 'description':"L'ENSPD est une grande école d'ingénieurs au Cameroun."})
        ub, _ = Institution.objects.get_or_create(name='University of Buea', defaults={'city':'Buea', 'type':'public', 'description':"One of the largest universities in Cameroon."})
        uc, _ = Institution.objects.get_or_create(name='Université de Yaoundé I', defaults={'city':'Yaoundé', 'type':'public', 'description':'Principale université au Cameroun.'})
        
        if not Field.objects.filter(name='Informatique (Computer Science)').exists():
            cs = Field.objects.create(
                name='Informatique (Computer Science)',
                description='Formation en programmation, réseaux, bases de données et intelligence artificielle.',
                duration_years=5,
                career_opportunities=['Développeur logiciel', 'Administrateur réseau', 'Expert cybersécurité'],
                required_skills=['Logique', 'Mathématiques', 'Analyse'],
                admission_criteria='Baccalauréat scientifique, concours d\'entrée',
                tuition_fees_min=50000, tuition_fees_max=100000
            )
            cs.institutions.add(enspd)

        if not Field.objects.filter(name='Génie Civil').exists():
            genie_civil = Field.objects.create(
                name='Génie Civil',
                description='Conception, construction et entretien des infrastructures (bâtiments, routes, ponts).',
                duration_years=5,
                career_opportunities=['Ingénieur en bâtiment', 'Chef de projet BTP', 'Urbaniste'],
                required_skills=['Physique', 'Mathématiques', 'Gestion de projet'],
                admission_criteria='Baccalauréat scientifique, concours d\'entrée',
                tuition_fees_min=50000, tuition_fees_max=100000
            )
            genie_civil.institutions.add(enspd, ub)

        if not Field.objects.filter(name='Médecine').exists():
            medecine = Field.objects.create(
                name='Médecine',
                description='Étude de la santé humaine, diagnostic, traitement et prévention des maladies.',
                duration_years=7,
                career_opportunities=['Médecin généraliste', 'Spécialiste', 'Chercheur en santé'],
                required_skills=['Biologie', 'Chimie', 'Empathie'],
                admission_criteria='Baccalauréat scientifique, concours très sélectif',
                tuition_fees_min=50000, tuition_fees_max=500000
            )
            medecine.institutions.add(uc)
        
        # Add other fields with checks

        self.stdout.write(self.style.NOTICE("Institutions and fields checked/created."))

    def create_questions(self):
        self.stdout.write(self.style.NOTICE("Creating questions..."))

        questions_to_create = [
            {
                "text":"Quels sujets vous passionnent le plus à l'école ?",
                "category":'academic_interests',
                "question_type":'mcq',
                "options":['Sciences (maths, physique, chimie)', 'Littérature et langues', 'Arts et design', 'Économie et gestion', 'Histoire et géographie']
            },
            {
                "text":"Comment évalueriez-vous vos compétences en résolution de problèmes complexes ?",
                "category":'perceived_skills',
                "question_type":'likert',
                "options":[1, 2, 3, 4, 5]
            },
            # Add all other questions here
        ]

        for q_data in questions_to_create:
            Question.objects.get_or_create(text=q_data['text'], defaults=q_data)

        self.stdout.write(self.style.NOTICE("Questions checked/created."))
