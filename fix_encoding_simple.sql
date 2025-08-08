-- Fix IP Management table character encoding
USE page_test;

-- Drop and recreate the table with proper encoding
DROP TABLE IF EXISTS ip_management;

-- Create IP Management table with proper UTF-8 encoding
CREATE TABLE ip_management (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_id VARCHAR(50) NOT NULL,
  ip_name VARCHAR(100) NOT NULL,
  ip_intro TEXT,
  running VARCHAR(50),
  portrait VARCHAR(100),
  mbti VARCHAR(20),
  preference TEXT,
  agent_link VARCHAR(200),
  updater VARCHAR(50),
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Set proper encoding for the session
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = utf8mb4_unicode_ci;

-- Insert 20 rows of sample data with proper Chinese characters
INSERT INTO ip_management (ip_id, ip_name, ip_intro, running, portrait, mbti, preference, agent_link, updater) VALUES
('hjhwx033cj21', '明细', '星座：白羊座；MBTI：INFP；属性：火；性格：热情开朗，勇敢直率，喜欢挑战', '火', '白羊座', 'ENTJ', '银行，美食，舞台互动', '明细多维度心理测评模型', '33'),
('hjhwx033cj22', '啵啵', '星座：金牛座；MBTI：ISFJ；属性：土；性格：稳重踏实，有耐心，重视安全感', '土', '金牛座', 'INFJ', '音乐，艺术，安静环境', '啵啵多模态情感陪伴智能体', '33'),
('hjhwx033cj23', '小智', '星座：双子座；MBTI：ENFP；属性：风；性格：聪明灵活，好奇心强，善于沟通', '风', '双子座', 'ENTP', '科技，创新，社交活动', '小智智能对话系统', '33'),
('hjhwx033cj24', '暖暖', '星座：巨蟹座；MBTI：ISFP；属性：水；性格：温柔体贴，家庭观念强，情感丰富', '水', '巨蟹座', 'INFP', '家庭，美食，温馨环境', '暖暖情感陪伴机器人', '33'),
('hjhwx033cj25', '阳光', '星座：狮子座；MBTI：ESFJ；属性：火；性格：自信阳光，领导能力强，喜欢被关注', '火', '狮子座', 'ENFJ', '表演，领导，社交活动', '阳光正能量传播者', '33'),
('hjhwx033cj26', '细心', '星座：处女座；MBTI：ISTJ；属性：土；性格：细致认真，追求完美，逻辑思维强', '土', '处女座', 'INTJ', '工作，学习，整理规划', '细心数据分析专家', '33'),
('hjhwx033cj27', '和谐', '星座：天秤座；MBTI：ENFP；属性：风；性格：追求平衡，善于协调，重视人际关系', '风', '天秤座', 'ENFP', '艺术，平衡，和谐环境', '和谐关系协调者', '33'),
('hjhwx033cj28', '深度', '星座：天蝎座；MBTI：INTJ；属性：水；性格：深沉神秘，洞察力强，意志坚定', '水', '天蝎座', 'INFJ', '研究，探索，深度思考', '深度洞察分析师', '33'),
('hjhwx033cj29', '自由', '星座：射手座；MBTI：ENTP；属性：火；性格：乐观自由，喜欢冒险，追求真理', '火', '射手座', 'ENTP', '旅行，冒险，自由探索', '自由探索引导者', '33'),
('hjhwx033cj30', '稳重', '星座：摩羯座；MBTI：ISTJ；属性：土；性格：稳重可靠，目标明确，责任感强', '土', '摩羯座', 'INTJ', '事业，规划，稳定发展', '稳重目标规划师', '33'),
('hjhwx033cj31', '创新', '星座：水瓶座；MBTI：ENTP；属性：风；性格：独特创新，思维超前，追求独立', '风', '水瓶座', 'ENTP', '科技，创新，独特想法', '创新思维启发者', '33'),
('hjhwx033cj32', '梦幻', '星座：双鱼座；MBTI：INFP；属性：水；性格：浪漫梦幻，富有同情心，艺术天赋', '水', '双鱼座', 'INFP', '艺术，音乐，梦幻世界', '梦幻艺术创作者', '33'),
('hjhwx033cj33', '智慧', '星座：白羊座；MBTI：INTJ；属性：火；性格：智慧理性，逻辑思维强，追求真理', '火', '白羊座', 'INTJ', '学习，研究，智慧探索', '智慧知识传播者', '33'),
('hjhwx033cj34', '温暖', '星座：金牛座；MBTI：ISFJ；属性：土；性格：温暖体贴，重视家庭，有耐心', '土', '金牛座', 'ISFJ', '家庭，美食，温馨服务', '温暖家庭守护者', '33'),
('hjhwx033cj35', '活力', '星座：双子座；MBTI：ENFP；属性：风；性格：活力四射，适应力强，善于表达', '风', '双子座', 'ENFP', '社交，娱乐，活力活动', '活力社交达人', '33'),
('hjhwx033cj36', '关怀', '星座：巨蟹座；MBTI：ISFP；属性：水；性格：关怀备至，情感细腻，重视关系', '水', '巨蟹座', 'ISFP', '关怀，陪伴，情感支持', '关怀情感陪伴者', '33'),
('hjhwx033cj37', '魅力', '星座：狮子座；MBTI：ESFJ；属性：火；性格：魅力四射，自信阳光，善于领导', '火', '狮子座', 'ESFJ', '表演，领导，魅力展示', '魅力表演艺术家', '33'),
('hjhwx033cj38', '精准', '星座：处女座；MBTI：ISTJ；属性：土；性格：精准细致，追求完美，逻辑清晰', '土', '处女座', 'ISTJ', '工作，分析，精准服务', '精准数据分析师', '33'),
('hjhwx033cj39', '平衡', '星座：天秤座；MBTI：ENFP；属性：风；性格：追求平衡，善于协调，重视和谐', '风', '天秤座', 'ENFP', '协调，平衡，和谐关系', '平衡关系协调者', '33'),
('hjhwx033cj40', '神秘', '星座：天蝎座；MBTI：INTJ；属性：水；性格：神秘深邃，洞察力强，意志坚定', '水', '天蝎座', 'INTJ', '研究，探索，神秘分析', '神秘洞察专家', '33');

-- Verify the data with proper encoding
SELECT * FROM ip_management LIMIT 5; 